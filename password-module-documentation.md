# Password Module — Complete System Documentation

> **South Point School Security Terminal**  
> Version: 1.0 | Stack: Vite + React (Frontend) · Django REST Framework (Backend) · PostgreSQL (Database)  
> Repository: [tiwariabhi0208/Password-Module](https://github.com/tiwariabhi0208/Password-Module)

---

## Table of Contents

1. [Project Overview & Purpose](#1-project-overview--purpose)
2. [System Architecture](#2-system-architecture)
3. [Technology Stack & Why We Chose It](#3-technology-stack--why-we-chose-it)
4. [Frontend — React Application](#4-frontend--react-application)
5. [Frontend Component Architecture](#5-frontend-component-architecture)
6. [Cryptography — How Encryption Works](#6-cryptography--how-encryption-works)
7. [Backend — Django REST Framework](#7-backend--django-rest-framework)
8. [REST API Reference](#8-rest-api-reference)
9. [Email System — When & Why You Get Emails](#9-email-system--when--why-you-get-emails)
10. [Database — Models & Schema](#10-database--models--schema)
11. [JWT Authentication & Token Security](#11-jwt-authentication--token-security)
12. [Rate Limiting & Security Headers](#12-rate-limiting--security-headers)
13. [Audit Trail / Activity Logs](#13-audit-trail--activity-logs)
14. [Django Admin Portal](#14-django-admin-portal)
15. [Environment Variables & Configuration](#15-environment-variables--configuration)
16. [Access Level Reference (RBAC Matrix)](#16-access-level-reference-rbac-matrix)
17. [Setup & Running Locally](#17-setup--running-locally)

---

## 1. Project Overview & Purpose

The **Password Module** (internally named "South Point School Security Terminal") is a **secure, institutional-grade credential vault** purpose-built for South Point School, Guwahati, Assam. Its core mission is to store and manage bank account credentials — account numbers, IFSC codes, usernames, passwords, transaction passwords — that the school administration uses for day-to-day payments and banking operations.

### Why This Was Built

Prior to this system, school bank credentials were stored in unencrypted Excel sheets or shared through WhatsApp. This created severe risks:
- Any staff member with access to the file could read plaintext passwords.
- There was no audit trail of who viewed or copied credentials.
- There was no access control — everyone had the same access.
- Credentials could be accidentally or maliciously modified with no accountability.

The Password Module solves all of these problems by:
- **Encrypting all sensitive data client-side** — the server never sees plaintext bank passwords.
- **Enforcing 3-tier role-based access control** — different staff get different levels of access.
- **Maintaining an immutable audit trail** — every login, view, edit, and delete is logged with IP address, timestamp, and admin name.
- **Requiring OTP email verification** for login (2FA) and for all destructive operations (password reset, email change).

---

## 2. System Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                     USER'S BROWSER                             │
│                                                                │
│  React App (Vite)  ──── cryptoHelper.js (AES-256, PBKDF2)     │
│                    │                                           │
│  Password is       │  Only encrypted ciphertexts leave browser │
│  NEVER sent        │  Master key NEVER leaves browser          │
│  to server         ▼                                           │
└────────────────────────────────────────────────────────────────┘
          │ HTTPS + JWT Bearer Token
          │ POST /api/v1/auth/login/  →  { email, loginHashHex }
          │ POST /api/v1/vault/       →  { encrypted_holder, encrypted_password, ... }
          ▼
┌────────────────────────────────────────────────────────────────┐
│                     DJANGO BACKEND                             │
│                                                                │
│  DRF Views → Permission Checks → JWT Verification             │
│         ↓                                                      │
│  ActivityLog (every action logged)                             │
│         ↓                                                      │
│  OTP Email via SMTP (Gmail / Custom SMTP)                      │
└────────────────────────────────────────────────────────────────┘
          │ SQL Queries (psycopg2)
          ▼
┌────────────────────────────────────────────────────────────────┐
│                     POSTGRESQL DATABASE                        │
│                                                                │
│  vault_api_admin          ← Admin user accounts                │
│  vault_api_encryptedbank  ← Encrypted bank credentials         │
│  vault_api_activitylog    ← Immutable audit trail              │
│  vault_api_entity         ← Registered school entities         │
│  token_blacklist_*        ← JWT logout blacklist               │
└────────────────────────────────────────────────────────────────┘
```

### Key Design Principles

| Principle | Implementation |
|-----------|----------------|
| **Zero Knowledge** | Server stores only ciphertexts. Master key derived client-side, never transmitted. |
| **Defense in Depth** | PBKDF2 key derivation + AES-256-GCM + Argon2id server hashing + JWT + HTTPS + HSTS |
| **Least Privilege** | 3-tier RBAC — each admin only gets the minimum permissions needed |
| **Immutable Audit** | ActivityLog records are locked — even superusers cannot edit or delete logs |
| **Fail Loudly** | Missing `SECRET_KEY`? Server refuses to start. Missing salt? 400 returned. |

---

## 3. Technology Stack & Why We Chose It

### Frontend

| Technology | Why Used |
|-----------|----------|
| **React 18** | Component-based UI with hooks for state, enabling clean separation of encrypted logic and display logic |
| **Vite** | Blazing-fast dev server and production bundler — much faster than Create React App |
| **Lucide React** | Clean, consistent icon set used throughout the UI (Eye, Lock, Shield, etc.) |
| **Web Crypto API** | Browser-native cryptography. Runs in a secure context, hardware-accelerated, no third-party library needed. Keys cannot be extracted from `importKey()` calls |
| **Vanilla CSS / Tailwind-style classes** | Custom design tokens for South Point's maroon/gold color palette |

### Backend

| Technology | Why Used |
|-----------|----------|
| **Django 5** | Battle-tested Python web framework with built-in ORM, admin panel, and security middleware |
| **Django REST Framework (DRF)** | Industry standard for building REST APIs in Django. Provides serializers, viewsets, permissions, throttling out of the box |
| **djangorestframework-simplejwt** | JWT implementation with refresh token rotation, blacklisting, and cookie-based storage |
| **django-cors-headers** | Allows the React frontend (port 5173) to make API calls to Django (port 8000) during development |
| **argon2-cffi** | Argon2id password hashing — the 2023 OWASP gold standard for password storage, resistant to GPU cracking |
| **python-dotenv** | Loads environment variables from `.env` file, keeping secrets out of source code |

### Database

| Technology | Why Used |
|-----------|----------|
| **PostgreSQL** | ACID-compliant, production-grade relational database. Chosen over SQLite for multi-user concurrent access and UUID primary key support |
| **UUID Primary Keys** | All records use UUID (not auto-increment integers). UUIDs are unguessable — an attacker cannot enumerate records by incrementing IDs in API calls |

### Email

| Technology | Why Used |
|-----------|----------|
| **Django SMTP Email** | Sends OTP verification codes for login 2FA, password reset, and email changes |
| **EmailMultiAlternatives** | Sends both HTML (styled) and plaintext fallback versions of OTP emails |
| **Inline CID Logo** | School logo is embedded in the email body using MIME image attachment with Content-ID, so it renders even without external image loading |

---

## 4. Frontend — React Application

The entire frontend is a single-page application (SPA) contained primarily in `src/app/App.jsx`. It has no external routing library — tab navigation is managed via React state.

### 4.1 Authentication Flow (Login / Forgot Password)

The login screen is the first thing a user sees. It consists of the `AuthCard` component and handles a multi-step authentication process.

#### Step 1: Fetch Salt

Before even attempting to hash the password, the frontend sends:

```
GET /api/v1/auth/salt/?email=user@example.com
```

This returns a 32-character hex salt (`{"salt": "a3f0b2c1..."}`) that is **deterministically derived** from the email using `HMAC-SHA256(SECRET_KEY, email)`. The salt is not stored in the database — it is computed on the fly. This design means:
- An attacker cannot enumerate registered emails (both registered and unregistered emails return a valid-looking salt).
- The same user always gets the same salt, which is required for consistent key derivation.

#### Step 2: Derive Login Hash (Client-Side)

Using the fetched salt, the browser runs PBKDF2 with 600,000 iterations to produce 64 bytes. The second 32 bytes become the `loginHashHex` — the value sent to the server as the "password".

**Why not send the raw password?**
Because if the API connection is ever compromised or logged, only the hash is exposed — not the actual password that the admin might reuse elsewhere.

#### Step 3: Login API Call

```
POST /api/v1/auth/login/
Body: { "email": "...", "password": "<64-char loginHashHex>" }
```

The server verifies `loginHashHex` against the Argon2id hash stored in the database.

#### Step 4 (If 2FA Enabled): OTP Email

If OTP is enabled (globally via `OTP_ENABLED=True` or per-user via `tfa_enabled=True`), the server:
1. Generates a cryptographically secure 6-digit OTP using `secrets.randbelow(900000) + 100000`.
2. Saves the OTP and a 5-minute expiry timestamp to the Admin record.
3. Sends an OTP email to the admin's registered address.

The frontend shows an OTP input form. The user enters the code and calls:

```
POST /api/v1/auth/login/verify/
Body: { "email": "...", "password": "<loginHashHex>", "otp": "123456" }
```

#### Step 5: JWT Issued

On success, the server returns:
- `access` — short-lived JWT access token (15 minutes), stored in React state (memory only, NOT localStorage).
- `refresh_token` — 7-day HttpOnly cookie, inaccessible to JavaScript.
- `user` — admin profile data including `level`, `name`, `email`, `tfa_enabled`.

#### Forgot Password Flow

1. User submits email → `POST /api/v1/auth/password-reset/` → OTP email sent.
2. User submits OTP → `POST /api/v1/auth/password-reset/key/` → returns `encrypted_vault_key`.
3. Client decrypts the vault key using the OLD password, re-encrypts it with the NEW password.
4. User submits new password + re-encrypted vault key → `POST /api/v1/auth/password-reset/verify/`.

**Why step 3?** The master encryption key that protects all bank data is stored encrypted with the admin's password. If we just reset the password without re-wrapping the vault key, the encrypted bank data would be permanently inaccessible (locked with the old key). The client-side re-wrapping process preserves data access across password changes.

---

### 4.2 Dashboard & Bank Credential Cards

After login, the main dashboard shows `BankCard` components — visual cards representing each bank account stored in the vault.

**Each card shows:**
- Bank name and initials (e.g., "HDFC", "SBI")
- Bank logo (fetched from a `getBankLogo()` mapping)
- Account type (Retail / Corporate)
- Branch name
- Entity association (which school branch owns this account)

**Viewing credentials:**
Clicking a card opens the `AccountModal`. This triggers:
1. `GET /api/v1/vault/<uuid>/` — fetches the encrypted record from the server.
2. The server logs the access in `ActivityLog` with the admin's name, IP, and timestamp.
3. The browser decrypts the ciphertext fields using the in-memory master key.
4. Decrypted values are shown in the modal with a copy button.

**Why log every single view?**
Because bank credentials are highly sensitive. If money goes missing from a school account, the audit log shows exactly who viewed that account's credentials, when, and from what IP address. This provides accountability.

**Search & Filter:**
The dashboard has a search bar that filters cards by bank name, branch, or entity name. It also supports Grid / List view toggle and sorting by creation date or bank name.

---

### 4.3 Add / Edit Bank Card Modal

The `AddBankModal` component allows Super Admins (Level 3) to add new bank accounts and Level 2+ admins to edit existing ones.

**When adding a bank card:**
1. Admin fills in plaintext fields: bank name, initial, account type, branch, entity, color.
2. Admin fills in sensitive fields: account holder, account number, IFSC, username, password, transaction password, photo.
3. On submit, the frontend:
   - Encrypts each sensitive field individually using `encryptData(plaintext, masterKey)` → AES-256-GCM.
   - Each field gets its own random 12-byte IV, so identical values produce different ciphertexts.
   - Sends encrypted ciphertexts to the server: `POST /api/v1/vault/`.
4. The server stores the ciphertexts in `EncryptedBank` table and logs the creation.

**Why encrypt fields individually?**
If all fields were encrypted together as one blob, changing the account number would require re-encrypting everything. Individual field encryption allows granular updates — only the changed field needs to be re-encrypted.

---

### 4.4 Admin Management Tab

**Available to: Level 3 (Super Admin) only**

This tab lets Super Admins:
- **View all registered admins** — name, email, level, department, campus, designation, active status.
- **Register a new admin** — fill in name, email, password, level (1/2/3), and optional profile fields.
- **Deactivate/Reactivate an admin** — a deactivated admin's JWT is immediately rejected on the next API call.
- **Delete an admin** — permanently removes the account.
- **Password visibility toggle** — the account password field has an Eye/EyeOff button to show/hide the typed password while registering.

**Unsaved form warning:** If you type anything in the Register Admin form and then try to switch tabs, a warning modal appears asking whether you want to discard changes. This prevents accidentally losing a half-filled registration form.

**Why can only Level 3 manage admins?**
Admin management is the highest-privilege operation — a compromised Level 2 account should not be able to promote itself to Level 3 or create new super admin accounts.

---

### 4.5 Entity Management Tab

**Available to: Level 3 (Super Admin) for add/delete; Level 1+ for viewing**

Entities represent organizational units — school branches, departments, or partner organizations — that own bank accounts. Examples: "South Point School, Guwahati", "DPS Nagaon", etc.

**Features:**
- **View all registered entities** — name, email, phone, creation date.
- **Register single entity** — name, email, phone number (exactly 10 digits validated).
- **Bulk entity registration** — enter multiple entities in a structured form; all are validated and registered atomically.
- **Delete an entity** — cascades to delete all bank accounts associated with it.

**Validation rules enforced on both frontend and backend:**
- Email must be valid.
- Phone must be exactly 10 digits.
- Entity email cannot match any admin email.
- Entity name cannot match any admin name.
- No duplicate emails or phone numbers.

---

### 4.6 Activity Logs Tab

**Available to: Level 2 and Level 3**

Shows the complete audit trail of all system actions in reverse chronological order. Each log entry shows:
- Timestamp (UTC)
- Action label (e.g., "Credential Accessed", "Login Success", "Admin Registered")
- Full details
- Admin who performed the action
- Log type color: Success (green), Info (blue), Warning (yellow), Error (red)
- IP address

**What actions are logged:**
- Login attempts (success and failure)
- OTP verification failures
- Credential viewed (every single view)
- Credential created / updated / deleted
- Admin registered / removed
- Profile updated
- Password reset (success and failure)
- Email changed
- Entities registered (single and bulk) / removed
- Database reset performed
- Logout

---

### 4.7 Settings Tab

The `Settings` component provides personal configuration options:
- **Dark/Light mode toggle** — theme persists to localStorage.
- **Change master password** — enters current password, new password, confirm new password. Eye/EyeOff visibility toggles on all three fields. Process re-derives keys, re-encrypts vault key, and updates `encrypted_vault_key` on the server.
- **Enable/Disable 2FA** — toggles `tfa_enabled` on the admin's account via `POST /api/v1/auth/tfa/toggle/`.
- **Change email** — OTP verified: sends code to new email, then confirms change.
- **Profile update** — name, department, campus, designation, phone.
- **Lock screen timeout** — configures how many minutes of inactivity before the stealth lock screen activates.
- **Database Reset** — destructive operation, Level 3 only, wipes all bank credentials, entities, and activity logs.

---

### 4.8 Help & Information Tab

The `HelpInfo` component serves as built-in documentation explaining:
- What each access level can and cannot do (Levels 1, 2, 3).
- Glossary of security terms used in the system:
  - Lock Screen & Inactivity Lock
  - AES-256 Encrypted Cryptographic Public Signature
  - Entities vs. Admins
  - Two-Factor Authentication (2FA/OTP)
  - Key Derivation (PBKDF2)
  - JWT & Session Management
- A "Contact Help Desk" button that opens the `HelpDeskModal` for support requests.

---

### 4.9 Stealth Lock Screen

The `StealthLockScreen` component activates after a configurable period of inactivity (default: 15 minutes). When locked:
- The entire dashboard is covered by a dark overlay.
- The admin must re-enter their master password to unlock.
- This is a client-side re-authentication — the password is re-derived locally and verified against a stored hash.
- The access token is NOT revoked — only the local screen is locked.
- This protects against **shoulder surfing** and **unattended session abuse** at the physical machine level.

---

### 4.10 Unsaved Form Warning Modal

Implemented in the tab change logic inside `App.jsx`:

When an admin has typed into the **Register Admin** or **Register Entity** form and then tries to:
- Click a different tab in the Sidebar
- Click a different tab in the Header
- Logout

A centered confirmation modal appears:

```
⚠️  Unsaved Admin Registration
You have unsaved changes in the Register Admin form.
Are you sure you want to leave? All entered data will be discarded.

[Cancel]   [Yes, Discard & Leave]
```

If the admin clicks "Yes, Discard & Leave", the form state is cleared and navigation proceeds. If "Cancel" is clicked, they remain on the current tab with all their entered data intact.

**Why?** Accidentally navigating away from a half-filled admin registration form would require starting over. This UX guard prevents frustration and data loss.

---

## 5. Frontend Component Architecture

```
src/
├── app/
│   ├── App.jsx                      ← Main application root (all tabs, state, crypto logic)
│   ├── utils/
│   │   ├── cryptoHelper.js          ← PBKDF2, AES-256-GCM, key derivation
│   │   └── apiClient.js             ← Axios-like API wrapper with JWT header injection
│   └── components/
│       ├── AuthCard.jsx             ← Login / OTP / Forgot Password screen card
│       ├── Header.jsx               ← Top navigation bar with tab buttons
│       ├── Sidebar.jsx              ← Left sidebar navigation (desktop)
│       ├── Footer.jsx               ← Bottom footer with version / info
│       ├── BankCard.jsx             ← Individual credential card in the vault grid
│       ├── AccountModal.jsx         ← Credential detail view (decrypts and shows fields)
│       ├── AddBankModal.jsx         ← Add / Edit bank credential form
│       ├── AccountSelectorModal.jsx ← Entity-filtered account picker
│       ├── Settings.jsx             ← All account settings (password, 2FA, theme, etc.)
│       ├── HelpInfo.jsx             ← Built-in user guide and glossary
│       ├── HelpDeskModal.jsx        ← Support request / help desk modal
│       ├── StealthLockScreen.jsx    ← Inactivity lock overlay
│       ├── LoadingScreen.jsx        ← Initial boot loading animation
│       ├── BoyCharacter.jsx         ← SVG animated character on auth screen
│       ├── SchoolCrest.jsx          ← South Point School crest SVG
│       ├── ModalDetailRow.jsx       ← Reusable label + value + copy button row
│       ├── theme.js                 ← Design tokens (MAROON, GOLD, BORDER constants)
│       └── ui/                      ← Low-level UI primitives (buttons, inputs, etc.)
```

---

## 6. Cryptography — How Encryption Works

### 6.1 Password Derivation (PBKDF2)

When an admin types their password, the following happens **entirely in the browser** before any network request:

```
masterPassword  +  salt (from server)
         ↓
   PBKDF2-HMAC-SHA256
   600,000 iterations
   512 bits output
         ↓
┌─────────────────┬──────────────────────┐
│  Bytes 0–31     │  Bytes 32–63         │
│  masterKey      │  loginHashHex        │
│  (stays local)  │  (sent to server)    │
└─────────────────┴──────────────────────┘
```

**600,000 iterations** — this is the OWASP 2023 recommended minimum for PBKDF2-HMAC-SHA256. Each iteration costs approximately 100 microseconds of CPU time. An attacker trying to brute-force the hash would need 600,000 × iterations_per_guess, making dictionary attacks economically infeasible.

**Salt derivation:**
The salt is not random — it is `HMAC-SHA256(SECRET_KEY, email.lower())[:32]`. This is deterministic (same input → same salt) which is required because the same password must produce the same key every time for decryption to work.

### 6.2 AES-256-GCM Data Encryption

All sensitive bank fields (account number, IFSC, password, etc.) are encrypted using **AES-256-GCM** before being sent to the server.

**Why AES-GCM over AES-CBC?**
- GCM provides **authenticated encryption** — it produces both a ciphertext AND a 16-byte authentication tag.
- If anyone modifies the ciphertext in the database (e.g., a malicious DBA), decryption throws a `DOMException` rather than silently returning garbage data. This detects tampering.
- CBC does not have this — it can silently decrypt tampered data.

**Structure of each encrypted field (base64 encoded):**

```
[ 12-byte random IV ] + [ ciphertext ] + [ 16-byte auth tag ]
          ↓ base64 encoded ↓
"aGVsbG8gd29ybGQ..."   (stored in PostgreSQL TEXT column)
```

Each encryption call generates a **new random 12-byte IV** from `window.crypto.getRandomValues()` — not `Math.random()`. This ensures that even if the same account number is stored in two different records, the ciphertexts will be completely different, preventing frequency analysis attacks.

### 6.3 Encrypted Vault Key

The `masterKey` (32 bytes derived from the admin's password) is itself stored in the database — but encrypted with the admin's password. This is the `encrypted_vault_key` field on the Admin model.

**Why store the encrypted vault key?**
When an admin changes their password, the master encryption key changes. Without re-wrapping, all encrypted bank data would become unreadable. The `encrypted_vault_key` allows the system to re-derive the new master key and re-wrap the vault key so data remains accessible.

### 6.4 Why Zero-Knowledge Design

The server is designed to be "zero knowledge" about the content of bank credentials:
- The server never receives plaintext passwords, account numbers, or IFSC codes.
- Even if the PostgreSQL database were stolen, all credential fields are AES-256-GCM ciphertext — completely unreadable without the master key that only the admin's password can derive.
- The server never stores the master key — only a re-encrypted version (`encrypted_vault_key`) that can only be unwrapped with the admin's password.

---

## 7. Backend — Django REST Framework

### 7.1 Project Layout

```
vault_backend/
├── manage.py
├── vault_backend/
│   ├── settings.py       ← All configuration (DB, JWT, email, security headers)
│   ├── urls.py           ← Root URL dispatcher
│   └── wsgi.py           ← WSGI entry point for production deployment
└── vault_api/
    ├── models.py         ← Admin, EncryptedBank, ActivityLog, Entity
    ├── serializers.py    ← DRF serializers for all models
    ├── views.py          ← All API views (919 lines, 18 views/viewsets)
    ├── urls.py           ← API endpoint URL patterns
    ├── admin.py          ← Django Admin panel registrations
    ├── backends.py       ← Custom VaultAuthBackend
    ├── email_utils.py    ← OTP email sending utility
    └── templates/
        └── vault_api/
            └── email_otp.html  ← Branded HTML email template
```

### 7.2 Custom User Model (Admin)

Django's default `User` model uses a `username` field. Our system uses **email as the login identifier**, so a fully custom user model was built extending `AbstractBaseUser` and `PermissionsMixin`:

| Field | Type | Purpose |
|-------|------|---------|
| `id` | UUID PK | Unguessable primary key |
| `email` | EmailField UNIQUE | Login identifier — replaces Django's default `username` |
| `original_email` | EmailField | Email used at registration, preserved for salt stability across email changes |
| `name` | CharField | Display name |
| `level` | IntegerField | RBAC clearance level: 1, 2, or 3 |
| `dept` | CharField | Department |
| `campus` | CharField | Campus/branch |
| `designation` | CharField | Job title |
| `phone` | CharField | Phone number |
| `is_active` | BooleanField | False = deactivated account, all JWTs rejected |
| `is_staff` | BooleanField | True = allows access to `/admin/` portal |
| `otp_code` | CharField(6) | Current active OTP (set to NULL after use) |
| `otp_expires_at` | DateTimeField | OTP expiry window (5 minutes from generation) |
| `tfa_enabled` | BooleanField | Per-user 2FA toggle (independent of global OTP_ENABLED setting) |
| `encrypted_vault_key` | TextField | Admin's master key, encrypted with their password |
| `date_joined` | DateTimeField | Immutable creation timestamp (`auto_now_add=True`) |

**`original_email` field:** When an admin changes their email, the salt derivation formula is `HMAC(SECRET_KEY, email)`. A different email would produce a different salt, making all previously derived keys invalid. `original_email` stores the email used during initial registration so the salt stays stable. When email is changed, the client re-derives keys with the new email and updates `encrypted_vault_key` accordingly.

**Why UUID primary keys?**
Auto-increment integers (1, 2, 3...) are guessable. An attacker who knows `GET /api/v1/admins/3/` returns a record can try `/admins/4/`, `/admins/5/`, etc. UUIDs are 128-bit values — guessing one is computationally impossible.

### 7.3 Permission System (RBAC)

Three custom DRF permission classes enforce role-based access control:

```python
class IsSuperAdmin(BasePermission):
    # Level 3 only. POST /vault/, DELETE /vault/<id>/, POST /admins/, POST /entities/
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_active and request.user.level == 3

class IsLimitedAccessOrAbove(BasePermission):
    # Level 2+. PUT/PATCH /vault/<id>/, GET /audit-logs/
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_active and request.user.level >= 2

class IsReadOnlyOrAbove(BasePermission):
    # Level 1+. GET /vault/, GET /entities/
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_active and request.user.level >= 1
```

These are checked before the view executes — unauthorized requests are rejected with `403 Forbidden` before any database query is made.

### 7.4 Custom Authentication Backend

The `VaultAuthBackend` in `vault_api/backends.py` solves a specific problem: when admins log in via the Django Admin panel at `/admin/`, they type their raw plaintext password. But the database stores a hash of the `loginHashHex` (the PBKDF2-derived value), not a hash of the raw password.

The custom backend tries authentication in two modes:
1. **Direct check** — `user.check_password(password)` — works when the React app sends `loginHashHex`.
2. **Derived check** — derives `loginHashHex` from the plaintext password using the same PBKDF2 formula, then checks against the stored hash — works when typing raw password in Django Admin.

```python
class VaultAuthBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        email = username or kwargs.get('email')
        user = Admin.objects.get(email__iexact=email)

        # Mode 1: Direct hash check (React app login)
        if user.check_password(password):
            return user

        # Mode 2: Derive from plaintext (Django Admin panel login)
        salt_hex = hmac.new(SECRET_KEY, email, sha256).hexdigest()[:32]
        derived   = pbkdf2_hmac('sha256', password, bytes.fromhex(salt_hex), 600000, 64)
        login_hash = derived[32:].hex()
        if user.check_password(login_hash):
            return user
```

---

## 8. REST API Reference

**Base URL:** `http://127.0.0.1:8000/api/v1/`
**Authentication:** `Authorization: Bearer <access_token>` (except salt and public auth endpoints)

### 8.1 Authentication APIs

| Method | Endpoint | Auth Required | Description |
|--------|----------|--------------|-------------|
| `GET` | `/auth/salt/` | None | Returns deterministic HMAC salt for email. Used before every login/password operation. |
| `POST` | `/auth/login/` | None | Phase 1 login: validates email + loginHashHex. Triggers OTP email if 2FA enabled. |
| `POST` | `/auth/login/verify/` | None | Phase 2 login: validates OTP code. Issues JWT access token + HttpOnly refresh cookie. |
| `POST` | `/auth/logout/` | JWT | Blacklists refresh token, clears cookie. |
| `POST` | `/auth/refresh/` | Cookie | Reads refresh token from HttpOnly cookie, issues new access token + rotated refresh token. |
| `POST` | `/auth/password-reset/` | None | Sends password reset OTP to admin's email. |
| `POST` | `/auth/password-reset/key/` | None | Returns `encrypted_vault_key` after OTP verification (for client-side re-encryption). |
| `POST` | `/auth/password-reset/verify/` | None | Verifies OTP, sets new password, optionally updates `encrypted_vault_key`. |
| `POST` | `/auth/email-change/` | JWT | Sends OTP to new email address for verification. |
| `POST` | `/auth/email-change/verify/` | JWT | Verifies OTP and updates admin's email address. |
| `POST` | `/auth/tfa/toggle/` | JWT | Enables or disables 2FA for the current admin. |
| `GET` | `/auth/profile/` | JWT | Returns current admin's profile data. |
| `PATCH` | `/auth/profile/` | JWT | Updates current admin's profile (name, dept, campus, designation, phone). |
| `POST` | `/auth/reset-database/` | JWT (Level 3) | Destroys all credentials, entities, and activity logs. |

#### Rate Limiting on Auth Endpoints

All auth endpoints (`/auth/login/`, `/auth/login/verify/`, `/auth/password-reset/`) are rate-limited to **5 requests per minute per IP** via the `login` throttle scope. This prevents brute-force attacks on OTP codes and login credentials.

### 8.2 Vault (Bank Credentials) APIs

| Method | Endpoint | Min Level | Description |
|--------|----------|-----------|-------------|
| `GET` | `/vault/` | Level 1 | List all bank credential records (returns ciphertexts). |
| `POST` | `/vault/` | Level 3 | Create new bank credential (receives ciphertexts from client). |
| `GET` | `/vault/<uuid>/` | Level 1 | Get single bank record. Logs access to ActivityLog. |
| `PUT`/`PATCH` | `/vault/<uuid>/` | Level 2 | Update bank record fields. |
| `DELETE` | `/vault/<uuid>/` | Level 3 | Permanently delete bank record. |

> **Important:** The server receives and stores ciphertexts only. It cannot read the plaintext values. All encryption/decryption happens in the browser.

### 8.3 Admin Management APIs

| Method | Endpoint | Min Level | Description |
|--------|----------|-----------|-------------|
| `GET` | `/admins/` | Level 3 | List all admin accounts. |
| `POST` | `/admins/` | Level 3 | Register new admin. Hashes password via Argon2id. |
| `GET` | `/admins/<uuid>/` | Level 3 | Get single admin profile. |
| `PUT`/`PATCH` | `/admins/<uuid>/` | Level 3 | Update admin (level, is_active, profile fields). |
| `DELETE` | `/admins/<uuid>/` | Level 3 | Delete admin account. |

### 8.4 Entity Management APIs

| Method | Endpoint | Min Level | Description |
|--------|----------|-----------|-------------|
| `GET` | `/entities/` | Level 1 | List all registered entities. |
| `POST` | `/entities/` | Level 3 | Register single entity. |
| `GET` | `/entities/<uuid>/` | Level 1 | Get single entity. |
| `DELETE` | `/entities/<uuid>/` | Level 3 | Delete entity (cascades to its bank accounts). |
| `POST` | `/entities/bulk/` | Level 3 | Bulk register multiple entities. Full validation: duplicates, format, admin conflicts. |

### 8.5 Audit Log API

| Method | Endpoint | Min Level | Description |
|--------|----------|-----------|-------------|
| `GET` | `/audit-logs/` | Level 2 | Returns all activity log entries, newest first. |

---

## 9. Email System — When & Why You Get Emails

The email system uses Django's SMTP backend with `EmailMultiAlternatives` to send both HTML and plain-text versions of every email.

### When Emails Are Sent

| Trigger | Email Type | Subject | Who Receives It |
|---------|-----------|---------|----------------|
| Login with 2FA enabled | OTP Verification | "Your Secure Vault OTP Verification Code" | The admin logging in |
| Forgot password request | Password Reset OTP | "Your Secure Vault Password Reset Code" | The admin resetting |
| Email address change | Email Change OTP | "Verify Your New Vault Email Address" | The **new** email address |

### Email Template Design

All emails use the branded HTML template at `vault_api/templates/vault_api/email_otp.html`:
- **Header:** Dark maroon (`#5C0C21`) background with school logo embedded inline via MIME CID.
- **Body:** White background with gold-accented OTP box displaying the 6-digit code in monospace `Courier New` font, 32px size, with 6px letter-spacing for readability.
- **OTP box border:** Dashed gold (`#C5A059`) border for visual distinctiveness.
- **Footer:** "© 2026 South Point School. All rights reserved. Guwahati, Assam, India."
- **Validity note:** Red text "Valid for 5 minutes only."

### Why 5-Minute OTP Expiry?

The OTP is 6 digits (range: 100000–999999 = 900,000 possibilities). With a 5-minute window and the rate limit of 5 attempts/minute, an attacker gets at most 25 guesses in 5 minutes — a 0.0028% chance of guessing correctly. This makes OTP brute-force statistically infeasible.

### OTP Generation Security

```python
otp_code = f"{secrets.randbelow(900000) + 100000}"
```

`secrets.randbelow()` uses the OS's cryptographic random source (`/dev/urandom` on Linux, `CryptGenRandom` on Windows) — NOT Python's `random` module, which is a pseudo-random generator predictable if the seed is known.

### OTP Verification — Constant-Time Comparison

```python
hmac.compare_digest(user.otp_code, otp_submitted)
```

**Why `compare_digest` instead of `==`?**
Python's `==` for strings is a timing oracle — it returns `False` as soon as it finds the first mismatching character. By measuring response time, an attacker could determine how many characters of their guess are correct. `hmac.compare_digest` always takes the same time regardless of where the mismatch is, preventing timing attacks.

### SMTP Configuration

```python
EMAIL_HOST     = os.environ.get('EMAIL_HOST', 'localhost')
EMAIL_PORT     = 587   # STARTTLS port
EMAIL_USE_TLS  = True
EMAIL_HOST_USER     = os.environ.get('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')
```

If `EMAIL_HOST_USER` is not set (development mode), Django falls back to `console.EmailBackend` — printing the OTP to the server terminal instead of actually sending. This allows development and testing without a real SMTP server.

---

## 10. Database — Models & Schema

### Admin Table (`vault_api_admin`)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID PK | Unguessable primary key |
| `email` | VARCHAR UNIQUE | Login identifier |
| `original_email` | VARCHAR | Email used at registration (for salt stability) |
| `name` | VARCHAR | Display name |
| `password` | VARCHAR | Argon2id hash of `loginHashHex` |
| `level` | INTEGER | RBAC level: 1, 2, or 3 |
| `dept` | VARCHAR | Department |
| `campus` | VARCHAR | Campus/branch |
| `designation` | VARCHAR | Job title |
| `phone` | VARCHAR | Phone number |
| `is_active` | BOOLEAN | False = deactivated account |
| `is_staff` | BOOLEAN | True = Django Admin portal access |
| `is_superuser` | BOOLEAN | True = all Django permissions |
| `otp_code` | VARCHAR(6) | Current active OTP (NULL when not active) |
| `otp_expires_at` | TIMESTAMP | OTP expiry time |
| `tfa_enabled` | BOOLEAN | Per-user 2FA toggle |
| `encrypted_vault_key` | TEXT | Master key encrypted with admin's password |
| `date_joined` | TIMESTAMP | Immutable creation timestamp |

### EncryptedBank Table (`vault_api_encryptedbank`)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID PK | Unguessable primary key |
| `entity_id` | UUID FK | Associated entity (school branch), CASCADE on delete |
| `name` | VARCHAR | Bank name (e.g., "HDFC Bank") — plaintext, safe to store |
| `initial` | VARCHAR(5) | Abbreviation (e.g., "HDFC") — plaintext |
| `color` | VARCHAR(7) | UI card hex color — plaintext |
| `account_type` | VARCHAR | "retail" or "corporate" — plaintext |
| `branch_name` | VARCHAR | Branch name — plaintext |
| `encrypted_holder` | TEXT | AES-256-GCM base64 ciphertext |
| `encrypted_account_number` | TEXT | AES-256-GCM base64 ciphertext |
| `encrypted_ifsc` | TEXT | AES-256-GCM base64 ciphertext |
| `encrypted_username` | TEXT | AES-256-GCM base64 ciphertext |
| `encrypted_password` | TEXT | AES-256-GCM base64 ciphertext |
| `encrypted_transaction_password` | TEXT | AES-256-GCM base64 ciphertext (nullable) |
| `photo_payload` | TEXT | Base64 encoded photo (max 1MB) — capped to prevent DoS |
| `created_at` | TIMESTAMP | Auto-set on INSERT |
| `updated_at` | TIMESTAMP | Auto-updated on every SAVE |

**Why store non-sensitive fields as plaintext?**
The bank name, initial, account type, branch name, and color are needed to render the bank card list on the dashboard WITHOUT requiring decryption. If everything were encrypted, the frontend would need to decrypt every single record just to show the card grid. Metadata is stored in plaintext; secrets are encrypted. An attacker knowing "HDFC Bank - Main Branch" cannot access the account — they still need the encrypted credentials.

### ActivityLog Table (`vault_api_activitylog`)

| Column | Type | Description |
|--------|------|-------------|
| `id` | BIGINT PK | Auto-increment (logs need ordered IDs) |
| `timestamp` | TIMESTAMP | `auto_now_add=True` — immutable, set once |
| `action` | VARCHAR | Short action label |
| `details` | TEXT | Full description |
| `user_id` | UUID FK (nullable) | FK to Admin (SET_NULL on admin delete) |
| `user_snapshot` | VARCHAR | Admin's name at time of action |
| `log_type` | VARCHAR | "success", "info", "warning", "error" |
| `ip_address` | GenericIPAddressField | IPv4 or IPv6, validated |

**Why `user_snapshot`?** If an admin account is deleted, the `user_id` FK becomes NULL. But `user_snapshot` preserves the name as a text field — so the audit trail still shows who performed the action even after their account is gone.

**Why `SET_NULL` not `CASCADE` on admin FK?**
`CASCADE` would delete all audit logs when an admin account is deleted — destroying the audit trail. `SET_NULL` preserves the log entry, just nullifying the FK reference.

### Entity Table (`vault_api_entity`)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID PK | Unguessable primary key |
| `name` | VARCHAR | Organization name |
| `email` | EmailField UNIQUE | Contact email |
| `phone` | VARCHAR(15) | 10-digit phone, validated in `clean()` |
| `created_at` | TIMESTAMP | Auto-set on INSERT |

---

## 11. JWT Authentication & Token Security

### Token Architecture

| Token | Storage | Lifetime | Purpose |
|-------|---------|---------|---------|
| **Access Token** | React memory (ref/state, NOT localStorage) | 15 minutes | Sent in `Authorization: Bearer` header with every API call |
| **Refresh Token** | HttpOnly cookie (`refresh_token`) | 7 days | Used ONLY to request new access tokens at `/auth/refresh/` |

### Why Memory Storage for Access Token?

Storing the access token in `localStorage` is a common XSS vulnerability. If an attacker injects malicious JavaScript, they can read `localStorage.getItem('access_token')` and steal the session. By storing the token in a React ref (JavaScript memory), it disappears when the page is closed or refreshed.

**Solution:** On page load, the app immediately calls `/auth/refresh/` to silently obtain a new access token using the HttpOnly cookie — without the user re-entering credentials.

### Why HttpOnly Cookie for Refresh Token?

An HttpOnly cookie cannot be accessed by `document.cookie` or any JavaScript. Even if an XSS attack injects a malicious script, it cannot steal the refresh token. The cookie is scoped to the narrow path `/api/v1/auth/refresh/` via `AUTH_COOKIE_PATH`, meaning it is ONLY sent to that one URL — not to every other API call.

### Token Rotation

`ROTATE_REFRESH_TOKENS = True` + `BLACKLIST_AFTER_ROTATION = True`:
- Every time the refresh token is used, a new one is issued and the old one is blacklisted.
- If an attacker steals a refresh token and tries to use it after the legitimate user already refreshed, the stolen token is already in the blacklist — immediately rejected.

---

## 12. Rate Limiting & Security Headers

### Rate Limiting

```python
'DEFAULT_THROTTLE_RATES': {
    'anon': '100/day',     # Unauthenticated IPs: 100 requests/day
    'user': '1000/day',    # Authenticated admins: 1000 requests/day
    'login': '5/minute',   # Login, OTP, password reset: 5 attempts/minute
}
```

### Security Headers

| Header | Value | Why |
|--------|-------|-----|
| `SECURE_SSL_REDIRECT` | True (production) | Forces all HTTP → HTTPS |
| `SESSION_COOKIE_SECURE` | True | Cookies only sent over HTTPS |
| `CSRF_COOKIE_SECURE` | True | CSRF cookie only over HTTPS |
| `SECURE_CONTENT_TYPE_NOSNIFF` | True | Prevents MIME-type sniffing attacks |
| `X_FRAME_OPTIONS` | DENY | Prevents clickjacking via iframes |
| `SECURE_HSTS_SECONDS` | 31536000 (1 year) | Browser refuses HTTP for 1 year after first HTTPS visit |
| `SECURE_HSTS_INCLUDE_SUBDOMAINS` | True | HSTS applies to all subdomains |
| `SECURE_HSTS_PRELOAD` | True | Submit to browser HSTS preload list |

### Password Hashing — Argon2id

```python
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.Argon2PasswordHasher',   # Primary
    'django.contrib.auth.hashers.PBKDF2PasswordHasher',   # Legacy fallback
]
```

**Argon2id** parameters used: `m=102400` (100MB memory), `t=2` (2 iterations), `p=8` (8 parallel threads). These are intentionally expensive — a standard GPU cannot parallelize Argon2id attacks due to the memory requirement.

---

## 13. Audit Trail / Activity Logs

The `ActivityLog` model is the accountability backbone of the system. Every meaningful operation creates an immutable `ActivityLog` record.

### Immutability Guarantee

In `vault_api/admin.py`:

```python
def has_add_permission(self, request): return False
def has_change_permission(self, request, obj=None): return False
def has_delete_permission(self, request, obj=None):
    return request.user.is_superuser  # Only allowed during DB reset
```

Even the Django Admin panel cannot create, edit, or delete log entries. The only way to delete logs is through the `DatabaseResetView`, which requires Level 3 AND writes a "Database Reset" log entry BEFORE deleting — so there is always at least one record proving the wipe happened and who did it.

### IP Address Tracking

```python
def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0].strip()
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip
```

The `X-Forwarded-For` header is checked first — this is correct for production deployments behind Nginx or a load balancer. The first IP in `X-Forwarded-For` is the original client IP.

---

## 14. Django Admin Portal

The Django Admin portal is available at `http://127.0.0.1:8000/admin/`.

**Access Requirements:**
- Admin account must have `is_staff = True`.
- Use your regular plaintext login password (the `VaultAuthBackend` handles the PBKDF2 derivation transparently — no special password needed).

**What you can do in Django Admin:**

| Section | What You Can Do |
|---------|----------------|
| **Admin users** | View, filter, search all admin accounts. |
| **EncryptedBank** | View encrypted credential records. Sensitive fields are read-only. |
| **ActivityLog** | View all audit logs. No add/edit permissions. Delete only for superusers. |
| **Entity** | View, search, manage entity records. |

**Why encrypted fields are read-only in Django Admin:**
The bank data was encrypted by the browser using a master key that the server never has. If a Django Admin user modifies the `encrypted_password` field and saves plain text, it overwrites the ciphertext. When the browser tries to decrypt it, it gets a cryptographic error and the credential is permanently inaccessible. Making these fields read-only prevents this irreversible corruption.

---

## 15. Environment Variables & Configuration

### Backend Environment Variables

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `SECRET_KEY` | **Yes** | 64+ char hex string | Django secret key for HMAC salt derivation and JWT signing |
| `DEBUG` | No | `False` | Never `True` in production |
| `ALLOWED_HOSTS` | No | `127.0.0.1,yourdomain.com` | Comma-separated allowed hostnames |
| `DB_NAME` | No | `vault_db` | PostgreSQL database name |
| `DB_USER` | No | `vault_user` | PostgreSQL username |
| `DB_PASSWORD` | No | `<password>` | PostgreSQL password |
| `DB_HOST` | No | `localhost` | PostgreSQL host |
| `DB_PORT` | No | `5432` | PostgreSQL port |
| `CORS_ALLOWED_ORIGINS` | No | `http://localhost:5173` | Frontend origins allowed |
| `OTP_ENABLED` | No | `True` | Enable 2FA OTP globally for all logins |
| `EMAIL_HOST` | No | `smtp.gmail.com` | SMTP server hostname |
| `EMAIL_PORT` | No | `587` | SMTP port (STARTTLS) |
| `EMAIL_USE_TLS` | No | `True` | Use STARTTLS |
| `EMAIL_HOST_USER` | No | `noreply@school.com` | SMTP login email |
| `EMAIL_HOST_PASSWORD` | No | `<app password>` | SMTP app password |
| `DEFAULT_FROM_EMAIL` | No | `Secure Vault <noreply@school.com>` | Email From address |

### Frontend Environment Variables

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `VITE_API_BASE_URL` | **Yes** | `http://127.0.0.1:8000/api/v1` | Backend API base URL |

---

## 16. Access Level Reference (RBAC Matrix)

| Feature | Level 1 (Read Only) | Level 2 (Limited Access) | Level 3 (Super Admin) |
|---------|:-------------------:|:------------------------:|:---------------------:|
| View bank credential cards | ✅ | ✅ | ✅ |
| Copy bank details to clipboard | ✅ | ✅ | ✅ |
| Search and sort bank cards | ✅ | ✅ | ✅ |
| View entity list | ✅ | ✅ | ✅ |
| Light/Dark mode toggle | ✅ | ✅ | ✅ |
| Change own password | ✅ | ✅ | ✅ |
| Enable/disable own 2FA | ✅ | ✅ | ✅ |
| Update own profile | ✅ | ✅ | ✅ |
| Change own email | ✅ | ✅ | ✅ |
| Edit bank credentials | ❌ | ✅ | ✅ |
| View activity audit logs | ❌ | ✅ | ✅ |
| Add new bank accounts | ❌ | ❌ | ✅ |
| Delete bank accounts | ❌ | ❌ | ✅ |
| Register entities (single) | ❌ | ❌ | ✅ |
| Register entities (bulk) | ❌ | ❌ | ✅ |
| Delete entities | ❌ | ❌ | ✅ |
| Register new admins | ❌ | ❌ | ✅ |
| Delete/deactivate admins | ❌ | ❌ | ✅ |
| Reset entire database | ❌ | ❌ | ✅ |

---

## 17. Setup & Running Locally

### Prerequisites

- Python 3.11+
- Node.js 18+ and npm
- PostgreSQL 15+

### Backend Setup

```bash
# 1. Navigate to backend directory
cd vault_backend

# 2. Create and activate virtual environment
python -m venv venv
venv\Scripts\activate           # Windows
# source venv/bin/activate      # macOS/Linux

# 3. Install dependencies
pip install -r requirements.txt

# 4. Create PostgreSQL database (run in psql)
# CREATE DATABASE vault_db;
# CREATE USER vault_user WITH PASSWORD 'yourpassword';
# GRANT ALL PRIVILEGES ON DATABASE vault_db TO vault_user;

# 5. Generate a strong SECRET_KEY
python -c "import secrets; print(secrets.token_hex(64))"

# 6. Run database migrations
python manage.py migrate

# 7. Create first Super Admin
python manage.py createsuperuser

# 8. Start backend server
python manage.py runserver
```

### Frontend Setup

```bash
# 1. Navigate to project root
cd Password-Module

# 2. Install dependencies
npm install

# 3. Configure .env file in project root:
# VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1

# 4. Start development server
npm run dev
```

### Accessing the System

| URL | Description |
|-----|-------------|
| `http://localhost:5173` | React frontend application |
| `http://127.0.0.1:8000/admin/` | Django Admin portal |
| `http://127.0.0.1:8000/api/v1/` | DRF API browser root |

---

*Document prepared for South Point School Security Terminal — Password Module v1.0*
*© 2026 South Point School. Guwahati, Assam, India.*
