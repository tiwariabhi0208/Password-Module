# Bug & Error Audit — Password-Module

Audit date: 2026-08-31

## 1. CRITICAL — Hardcoded "admin123" backdoor password

**Files:** `src/app/components/StealthLockScreen.jsx:19`, `src/app/components/Settings.jsx:47-48`

Both files independently fall back to the SHA-256 hash of the literal string `"admin123"` whenever the real password hash prop is falsy:

```js
const targetHash = passwordHash || "01b307acba4f54f55aafc433b7c5b11d857fbcb798835848ab22c7104b2c1592";
```

```js
const defaultHash = "01b307acba4f54f55aafc433b7c5b11d857fbcb798835848ab22c7104b2c1592"; // SHA-256 of "admin123"
const targetPasswordHash = masterPasswordHash || defaultHash;
```

`targetHash`/`targetPasswordHash` gates:
- Unlocking the vault from the inactivity lock screen (`StealthLockScreen`)
- "Export Backup" and **"Reset Database"** (destructive) in Settings

Any state where the passed-in hash prop is empty/undefined (prop wiring bug, stale re-render, future refactor) turns the master-password check into an unconditional "admin123" bypass. The identical fallback string is duplicated in two independent files, which strongly suggests a leftover dev/test bypass rather than a one-off typo. **Remove immediately.**

---

## 2. CRITICAL — Forgot-password flow permanently breaks vault decryption

**Files:** `src/app/App.jsx:1005-1050` (`handlePasswordResetConfirm`), `vault_backend/vault_api/views.py:360-419` (`PasswordResetConfirmView`)

The vault key (`encrypted_vault_key`) is stored per-admin, encrypted with `masterKey = PBKDF2(password, salt)`. The salt is fixed per email, so changing the password changes `masterKey` even though the salt doesn't change.

The **in-session** "Change Password" flow (`App.jsx` ~2997-3012) correctly re-wraps: it derives the new key, re-encrypts the currently-held `vaultKey` with it, and PATCHes `encrypted_vault_key` to the server alongside the new login hash.

The **forgot-password** flow does none of this:
- `handlePasswordResetConfirm` only derives the new hash and calls `/auth/password-reset/verify/`; it never re-encrypts/re-uploads `encrypted_vault_key`.
- `PasswordResetConfirmView.post` (line 404) only does `user.set_password(new_password)` and never touches `encrypted_vault_key`.

**Failure scenario:** user forgets their password → uses "Forgot Password" → resets it successfully → logs in → `decryptData(userData.encrypted_vault_key, derived.masterKey)` (App.jsx ~line 495/566) throws because the stored ciphertext is still wrapped under the *old* master key → caught, `vKey = null`, "Decryption Failure" shown, and every bank card falls back to `"[Locked / Encrypted]"` **permanently**, with no recovery path in the code. The password-recovery feature destroys the data it's meant to help recover.

---

## 3. HIGH — Fake "Sign Out" on the stealth lock screen doesn't actually log out

**Files:** `src/app/components/StealthLockScreen.jsx:109-121`, `src/app/App.jsx:1550-1558`

The "Sign Out / Exit" button only calls `setStealthMode(false); setStealthPassword(""); setStealthError(""); setScreen("login")`. `App.jsx` passes the raw `setScreen` setter, not `handleLogout`. It never:
- Calls `POST /auth/logout/`
- Blacklists the refresh token
- Clears the in-memory access token (`apiClient.js` module-level `accessToken`)
- Clears `vaultKey`/`masterKey` React state

**Failure scenario:** admin locks the vault, clicks "Sign Out / Exit" believing the session ended, walks away. The UI shows the login screen, but the HttpOnly `refresh_token` cookie is still valid server-side and the access token/vault key remain live in memory — a usable session persists on that browser/tab.

---

## 4. MEDIUM — OTP field shared/unscoped across three unrelated flows

**Files:** `vault_backend/vault_api/models.py:76-78` (`otp_code`/`otp_expires_at` on `Admin`), used by `LoginView`, `LoginVerifyView`, `PasswordResetRequestView`, `PasswordResetConfirmView`, `EmailChangeRequestView`, `EmailChangeConfirmView`

No "purpose"/"type" discriminator exists on the stored OTP. `PasswordResetRequestView` is `AllowAny` and requires only a known, registered email — no password.

**Failure scenario:** victim is mid-flow on an authenticated action that generates an OTP (e.g. `EmailChangeRequestView`, which only they can trigger). An attacker who knows the victim's email calls `POST /auth/password-reset/` repeatedly; this overwrites `otp_code`/`otp_expires_at` on the same `Admin` row, silently invalidating whatever OTP the victim was about to submit for the unrelated flow — no credentials required. A griefing/DoS vector rooted in a real data-modeling defect (one shared code field for three purposes).

---

## 5. MEDIUM — OTP comparisons use non-constant-time `!=`

**Files:** `vault_backend/vault_api/views.py:212` (`LoginVerifyView`), `:384` (`PasswordResetConfirmView`), `:477` (`EmailChangeConfirmView`)

All three do `user.otp_code != otp_submitted` — a plain Python string comparison, which short-circuits on the first mismatched character and is not constant-time, unlike the module's own `hmac.new(...)` usage elsewhere in the same file (e.g. `SaltView`). A remote timing side-channel against a 6-digit numeric OTP is a real (if narrow) attack surface.

**Fix:** use `hmac.compare_digest`.

---

## 6. MEDIUM — Password-reset OTP endpoints skip the tighter login throttle

**Files:** `vault_backend/vault_api/views.py:313-419` (`PasswordResetRequestView`, `PasswordResetConfirmView`); compare `:194-195` (`LoginVerifyView` sets `throttle_scope = 'login'` → 5/minute)

Neither reset view sets `throttle_scope = 'login'`, so they fall back to `DEFAULT_THROTTLE_CLASSES` (`AnonRateThrottle`, 100/day per IP per `settings.py:147`). The 6-digit reset OTP is guessable at a much looser rate than the functionally identical login OTP — an inconsistency in the brute-force protection model for two endpoints guarding the same kind of secret.

---

## 7. LOW — No master-password strength check on forgot-password reset

**Files:** `src/app/App.jsx:1005-1050` vs `:2986-2990`

The in-session "Change Password" form enforces `newPasswordVal.length < 10` before submitting. `handlePasswordResetConfirm` only checks `!newPassword.trim()` (non-empty). A user who forgot their password can reset it to a single character (`"a"`) via the forgot-password flow, producing a materially weaker master key than the app otherwise enforces.

---

## 8. LOW — Duplicated OTP-screen membership check will drift

**File:** `src/app/App.jsx` (~line 858 and ~864-878)

Two separate `useEffect`s each independently check `screen !== "forgot-step2" && screen !== "login-otp"` instead of sharing one source of truth. Add a third OTP screen later and update only one of these, and the timer-reset effect and the timer-restart effect will disagree about which screens are OTP screens — silently reintroducing the stale-timer bug the last commit fixed.

---

## 9. LOW — Dead `useCallback` on `fetchBanks`

**File:** `src/app/App.jsx:360`

`fetchBanks` was wrapped in `useCallback([vaultKey])`, but no effect depends on the `fetchBanks` reference itself — the only effect that calls it depends on `[accessToken, vaultKey]`, and every other call site invokes it directly from event handlers. The memoization changes no behavior; it's dead weight that looks like a fix.

---

## Priority to fix

1. Remove the hardcoded "admin123" backdoor (#1) — active security hole.
2. Fix forgot-password to re-wrap `encrypted_vault_key` under the new master key (#2) — silent, permanent data loss.
3. Make "Sign Out" on the lock screen call real logout (#3).
4. Everything else (#4-#9) in order of severity as time allows.
