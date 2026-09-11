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
12. [Rate Limiting, Security Headers & Connection Pooling](#12-rate-limiting-security-headers--connection-pooling)
13. [Audit Trail / Activity Logs](#13-audit-trail--activity-logs)
14. [Django Admin Portal](#14-django-admin-portal)
15. [Environment Variables & Configuration](#15-environment-variables--configuration)
16. [Access Level Reference (RBAC Matrix)](#16-access-level-reference-rbac-matrix)
17. [Setup, Docker & CI/CD Deployment](#17-setup-docker--cicd-deployment)

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
┌────────────────────────────────────────────────────────────────────────────────┐
│                            USER'S BROWSER                                      │
│                                                                                │
│  React App (Vite)  ──── cryptoHelper.js (AES-256-GCM, PBKDF2)                   │
│                    │                                                           │
│  Password &        │  • Only ciphertexts & hashes leave browser                 │
│  Master Key        │  • Zero-Knowledge Rescue Kit (Recovery Key) supported    │
│  NEVER sent        │  • In-memory JWT access token, HttpOnly refresh cookie    │
│  to server         ▼                                                           │
└────────────────────────────────────────────────────────────────────────────────┘
          │ HTTPS + JWT Bearer Token
          │ POST /api/v1/auth/login/         → { email, loginHashHex }
          │ POST /api/v1/vault/              → { encrypted_holder, encrypted_password, ... }
          │ POST /api/v1/vault/escrow-sync/  → Syncs Fernet-wrapped escrow key
          ▼
┌────────────────────────────────────────────────────────────────────────────────┐
│                            DJANGO BACKEND                                      │
│                                                                                │
│  DRF Views → RBAC Clearance → Scoped Rate Throttling → DRF Versioning (v1)      │
│         │                                                                      │
│         ├── Celery Worker Queue ─── Async Security Alert Emails via SMTP       │
│         ├── Redis In-Memory Cache ─ Response Caching & Cache Invalidation     │
│         ├── Server Escrow Engine ── Fernet Vault Key Recovery Engine           │
│         └── ActivityLog ────────── Immutable Audit Trail (IP & Snapshot)       │
└────────────────────────────────────────────────────────────────────────────────┘
          │ SQL Queries (psycopg2, Connection Pool max_age=600)
          ▼
┌────────────────────────────────────────────────────────────────────────────────┐
│                         POSTGRESQL DATABASE (UUID PKs)                         │
│                                                                                │
│  vault_api_admin          ← Admins & Key Escrow/Rescue Kit Hashes              │
│  vault_api_encryptedbank  ← Encrypted Bank Credentials (Soft Delete Enabled)  │
│  vault_api_activitylog    ← B-Tree Indexed Audit Trail Logs                   │
│  vault_api_entity         ← Registered Entities (Soft Delete Enabled)          │
│  token_blacklist_*        ← JWT Logout Blacklist Table                         │
└────────────────────────────────────────────────────────────────────────────────┘
```

### Key Design Principles

| Principle | Implementation |
|-----------|----------------|
| **Zero Knowledge** | Server stores only ciphertexts. Master key derived client-side, never transmitted. Zero-knowledge Rescue Kit recovery key for lost password emergency restore. |
| **Defense in Depth** | PBKDF2 key derivation (600,000 iterations) + AES-256-GCM + Argon2id server password hashing + JWT + HTTPS + HSTS |
| **Server Key Escrow** | Optional Fernet key escrow engine (`vault_escrow.py`) encrypted under server secret (`VAULT_ESCROW_KEY`) to safely assist in OTP-verified resets. |
| **Soft Deletion** | Models support `is_deleted` and `deleted_at` timestamps with Super Admin `.restore()` endpoints to protect against accidental data destruction. |
| **Least Privilege** | 3-tier RBAC clearance matrix — each admin only gets the minimum permissions required for their role |
| **Immutable Audit** | ActivityLog records are locked — even superusers cannot edit or delete logs outside factory database reset. |
| **Async Tasks & Caching** | Redis caching for entity lists with automatic invalidation; Celery queue for asynchronous security alert emails. |
| **Fail Loudly** | Missing `SECRET_KEY`? Server refuses to start. Missing salt or malformed payload? 400 Bad Request returned. |

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
| **Django REST Framework (DRF)** | Industry standard for building REST APIs in Django. Provides serializers, viewsets, permissions, throttling, and URL versioning out of the box |
| **djangorestframework-simplejwt** | JWT implementation with refresh token rotation, blacklisting, and cookie-based storage |
| **django-cors-headers** | Allows the React frontend (port 5173) to make API calls to Django (port 8000) during development |
| **argon2-cffi** | Argon2id password hashing — the 2023 OWASP gold standard for password storage, resistant to GPU cracking |
| **cryptography (Fernet)** | Used in `vault_escrow.py` for symmetric server-side key escrow encryption using `VAULT_ESCROW_KEY` |
| **Redis & django-redis** | In-memory cache store providing high-performance entity caching and Celery task broker backend |
| **Celery** | Asynchronous task queue for offloading audit alert email dispatching without blocking web threads |
| **python-dotenv** | Loads environment variables from `.env` file, keeping secrets out of source code |

### Database

| Technology | Why Used |
|-----------|----------|
| **PostgreSQL 15** | ACID-compliant, production-grade relational database with connection pooling (`CONN_MAX_AGE=600`) |
| **UUID Primary Keys** | All records use UUID (not auto-increment integers). UUIDs are unguessable — an attacker cannot enumerate records by incrementing IDs in API calls |
| **B-Tree Indexes** | Single-column and composite database indexes across Admin, EncryptedBank, ActivityLog, and Entity tables for sub-millisecond query response times |

### Email

| Technology | Why Used |
|-----------|----------|
| **Django SMTP Email** | Sends OTP verification codes for login 2FA, password reset, and email changes |
| **EmailMultiAlternatives** | Sends both HTML (styled) and plaintext fallback versions of OTP emails |
| **Inline CID Logo** | School logo is embedded in the email body using MIME image attachment with Content-ID, so it renders even without external image loading |

### DevOps & Infrastructure

| Technology | Why Used |
|-----------|----------|
| **Docker & Docker Compose** | Multi-container stack definitions for Django web server, Gunicorn WSGI, PostgreSQL database, Redis, and Celery workers |
| **GitHub Actions CI** | Automated continuous integration testing running backend Django check/tests and frontend Vite production builds on every push |

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

#### Forgot Password & Key Recovery Flows

The system provides three distinct recovery paths when resetting a password:

1. **Option A: Standard Password Reset (With Old Password)**
   - User submits email → `POST /api/v1/auth/password-reset/` → OTP email sent.
   - User submits OTP → `POST /api/v1/auth/password-reset/key/` → returns `encrypted_vault_key`.
   - Client decrypts vault key using OLD password, re-encrypts with NEW password.
   - User submits new password + re-encrypted vault key → `POST /api/v1/auth/password-reset/verify/`.

2. **Option B: Emergency Rescue Kit Key Recovery (Zero Knowledge)**
   - If old password is forgotten, user enters their 32-character **Rescue Kit Key** (`XXXX-XXXX-XXXX-XXXX-XXXX-XXXX`).
   - Client derives recovery master key (PBKDF2 100k iterations) and decrypts `recovery_encrypted_vault_key`.
   - Client re-encrypts the vault key with the NEW password and submits to `/auth/password-reset/verify/`.

3. **Option C: Server-Side Escrow Recovery (OTP-Only)**
   - If user has lost both old password and Emergency Rescue Kit, user requests server escrow key unwrap.
   - Server verifies OTP and calls `POST /api/v1/auth/password-reset/escrow-key/`, returning the Fernet-decrypted vault key.
   - Client re-encrypts the vault key under NEW password and calls `/auth/password-reset/verify/`.

**Why client-side re-wrapping?** The master encryption key that protects all bank data is stored encrypted with the admin's password. Re-wrapping preserves data access across password changes without revealing the raw key to the server.

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

**Search & Filter:**
The dashboard has a search bar that filters cards by bank name, branch, or entity name. It supports Grid / List view toggles, mobile responsive toolbar layout, and sorting by creation date or bank name. Paginated API responses (`{ count, results }`) are automatically normalized via `extractDataList()`.

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
4. The server stores the ciphertexts in `EncryptedBank` table (with `is_deleted=False`) and logs the creation.

---

### 4.4 Admin Management Tab

**Available to: Level 3 (Super Admin) only**

This tab lets Super Admins:
- **View all registered admins** — name, email, level, department, campus, designation, phone, active status.
- **Register a new admin** — fill in name, email, password, level (1/2/3), and profile fields.
- **Deactivate/Reactivate an admin** — a deactivated admin's JWT is immediately rejected on the next API call.
- **Delete an admin** — permanently removes the account.
- **Password visibility toggle** — the account password field has an Eye/EyeOff button to show/hide the typed password while registering.

---

### 4.5 Entity Management Tab

**Available to: Level 3 (Super Admin) for add/delete/restore; Level 1+ for viewing**

Entities represent organizational units — school branches, departments, or partner organizations — that own bank accounts. Examples: "South Point School, Guwahati", "DPS Nagaon", etc.

**Features:**
- **View all registered entities** — name, email, phone, creation date.
- **Register single entity** — name, email, phone number (exactly 10 digits validated).
- **Bulk entity registration** — enter multiple entities in a structured form; all are validated and registered atomically.
- **Delete an entity** — soft deletes the entity record (`is_deleted=True`), preserving data integrity.
- **Restore an entity** — Super Admins can restore soft-deleted entities (`POST /api/v1/entities/<uuid>/restore/`).

---

### 4.6 Activity Logs Tab

**Available to: Level 2 and Level 3**

Shows the complete audit trail of all system actions in reverse chronological order. Each log entry shows:
- Timestamp (UTC)
- Action label (e.g., "Credential Accessed", "Login Success", "Admin Registered", "Vault Key Escrow Recovery")
- Full details
- Admin who performed the action
- Log type color: Success (green), Info (blue), Warning (yellow), Error (red)
- IP address

---

### 4.7 Settings Tab

The `Settings` component provides personal configuration options:
- **Dark/Light mode toggle** — theme persists to localStorage.
- **Change master password** — enters current password, new password, confirm new password. Re-derives keys, re-encrypts vault key, updates server `encrypted_vault_key`, and re-syncs escrow key.
- **Enable/Disable 2FA** — toggles `tfa_enabled` on the admin's account via `POST /api/v1/auth/tfa/toggle/`.
- **Change email** — OTP verified: sends code to new email, then confirms change.
- **Profile update** — name, department, campus, designation, phone.
- **Emergency Rescue Kit Generator** — generates and downloads/prints a 32-character Emergency Rescue Kit recovery key.
- **Lock screen timeout** — configures inactivity timeout before stealth lock screen activates.
- **Database Reset** — destructive operation (Level 3 only). Vertically/horizontally centered modal with optional `purgeAdmins` checkbox. Automatically purges client session (`onLogout`), clearing tokens and master key from memory.

---

### 4.8 Help & Information Tab

The `HelpInfo` component serves as built-in documentation explaining:
- What each access level can and cannot do (Levels 1, 2, 3).
- **Emergency Rescue Kit User Guide** — step-by-step instructions on generating, storing, and using recovery keys.
- Glossary of security terms used in the system:
  - Lock Screen & Inactivity Lock
  - AES-256 Encrypted Cryptographic Public Signature
  - Emergency Rescue Kit & Key Escrow
  - Entities vs. Admins
  - Two-Factor Authentication (2FA/OTP)
  - Key Derivation (PBKDF2)
  - JWT & Session Management
- A "Contact Help Desk" button that opens the `HelpDeskModal` with Rescue Kit support guidelines.

---

### 4.9 Stealth Lock Screen

The `StealthLockScreen` component activates after a configurable period of inactivity (default: 15 minutes). When locked:
- The entire dashboard is covered by a dark overlay.
- The admin must re-enter their master password to unlock.
- Client-side re-authentication — password is re-derived locally and verified against a stored hash.
- Access token is NOT revoked — only local screen is locked, protecting against physical machine access.

---

### 4.10 Unsaved Form Warning Modal

Implements navigation guards in `App.jsx`:
When an admin has typed into **Register Admin** or **Register Entity** forms and attempts to switch tabs or logout, a centered warning modal prompts for confirmation to discard or cancel.

---

### 4.11 Emergency Rescue Kit Modal

The `RescueKitModal` UI component allows admins to view, copy, download, or print their 32-character Zero-Knowledge Emergency Rescue Kit. The key is formatted as 6 four-character blocks (`XXXX-XXXX-XXXX-XXXX-XXXX-XXXX`) for ease of physical paper transcription.

---

## 5. Frontend Component Architecture

```
src/
├── app/
│   ├── App.jsx                      ← Main application root (all tabs, state, crypto logic, modals)
│   ├── utils/
│   │   ├── cryptoHelper.js          ← PBKDF2, AES-256-GCM, Rescue Kit key derivation & wrapping
│   │   └── apiClient.js             ← Axios-like API wrapper with JWT header injection
│   └── components/
│       ├── AuthCard.jsx             ← Login / OTP / Forgot Password screen card
│       ├── Header.jsx               ← Top navigation bar with tab buttons
│       ├── Sidebar.jsx              ← Left sidebar navigation (desktop)
│       ├── Footer.jsx               ← Bottom footer with version, compact mobile layout
│       ├── BankCard.jsx             ← Individual credential card in the vault grid
│       ├── AccountModal.jsx         ← Credential detail view (decrypts and shows fields)
│       ├── AddBankModal.jsx         ← Add / Edit bank credential form
│       ├── AccountSelectorModal.jsx ← Entity-filtered account picker
│       ├── Settings.jsx             ← Account settings (password, 2FA, theme, Rescue Kit, DB reset)
│       ├── HelpInfo.jsx             ← Built-in user guide, glossary, & Rescue Kit manual
│       ├── HelpDeskModal.jsx        ← Support request & Rescue Kit emergency guide modal
│       ├── StealthLockScreen.jsx    ← Inactivity lock overlay
│       ├── LoadingScreen.jsx        ← Initial boot loading animation (1.2s branded splash)
│       ├── BoyCharacter.jsx         ← SVG animated character on auth screen (hidden on mobile)
│       ├── SchoolCrest.jsx          ← South Point School crest SVG
│       ├── ModalDetailRow.jsx       ← Reusable label + value + copy button row
│       ├── theme.js                 ← Design tokens (MAROON, GOLD, BORDER constants)
│       └── ui/                      ← Low-level UI primitives (buttons, inputs, modals)
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

### 6.4 Zero-Knowledge Emergency Rescue Kit (Recovery Key)

To prevent permanent data loss when an admin forgets their master password, the system includes a zero-knowledge recovery key mechanism:

```
[ 24 Random Bytes ] → 32 Hex Characters → Formatted: "A3F8-99B2-4C1E-77D0-55FA-1234"
                                  │
                                  ▼
                   PBKDF2-HMAC-SHA256 (100,000 iterations)
                   Salt: "vault-rescue-kit-salt-2026"
                                  │
                                  ▼
                        recoveryMasterKey (256-bit)
                                  │
                                  ▼
    AES-256-GCM Encrypt(masterKey) → stored as `recovery_encrypted_vault_key`
```

- Generated client-side via `generateRecoveryKey()`.
- The raw Recovery Key string is **never** sent to the server.
- The server receives only `recovery_encrypted_vault_key` (the master key encrypted under the derived recovery key).
- Allows full zero-knowledge recovery of the vault during password resets.

### 6.5 Server-Side Key Escrow Engine (`vault_escrow.py`)

As a safety net for admins who lose both their master password AND their paper Emergency Rescue Kit, the backend implements server-side key escrow:

```
masterKey (hex) ──── Fernet Symmetric Cipher ──── stored as `escrow_encrypted_vault_key`
                             ▲
                             │
                  Key: settings.VAULT_ESCROW_KEY
                       (SECRET_KEY + ESCROW_MASTER_SALT)
```

- When configured (`VAULT_ESCROW_KEY` set), the browser sends the vault key over authenticated HTTPS to `/api/v1/auth/vault/escrow-sync/`.
- During an OTP-verified password reset, an admin without their Recovery Key can request escrow unwrap (`POST /api/v1/auth/password-reset/escrow-key/`).
- This path deliberately breaks zero-knowledge guarantees to prevent total lockout, but is strictly gated behind OTP verification, IP logging, and rate throttling.

### 6.6 Why Zero-Knowledge Design

The server is designed to be "zero knowledge" about the content of bank credentials:
- The server never receives plaintext passwords, account numbers, or IFSC codes.
- Even if the PostgreSQL database were stolen, all credential fields are AES-256-GCM ciphertext — completely unreadable without the master key that only the admin's password or Recovery Key can derive.
- The server never stores the master key in plaintext — only re-encrypted versions (`encrypted_vault_key`, `recovery_encrypted_vault_key`, and Fernet-wrapped `escrow_encrypted_vault_key`).

---

## 7. Backend — Django REST Framework

### 7.1 Project Layout

```
vault_backend/
├── manage.py
├── Dockerfile            ← Container definition for Django/Gunicorn
├── .dockerignore
├── requirements.txt      ← Dependencies (Django, DRF, Celery, Redis, argon2-cffi, cryptography)
├── vault_backend/
│   ├── settings.py       ← Configuration (DB, JWT, Redis, Celery, Rate limits, Security headers)
│   ├── celery.py         ← Celery worker app configuration & broker setup
│   ├── urls.py           ← Root URL dispatcher with DRF Router & /api/v1/ versioning
│   └── wsgi.py           ← WSGI entry point for Gunicorn
└── vault_api/
    ├── models.py         ← Admin, EncryptedBank, ActivityLog, Entity, SoftDeleteManager
    ├── serializers.py    ← DRF serializers with escrow & recovery key fields
    ├── views.py          ← DRF Views & ViewSets (Redis caching, Soft Delete, Escrow endpoints)
    ├── urls.py           ← API endpoint routing definitions
    ├── admin.py          ← Django Admin portal custom configuration
    ├── backends.py       ← Custom VaultAuthBackend (supports CLI & PBKDF2 hashes)
    ├── email_utils.py    ← Async OTP & Security email dispatchers
    ├── tasks.py          ← Celery background task queue definitions
    ├── pagination.py     ← StandardResultsSetPagination (page_size: 50, max: 200)
    ├── vault_escrow.py   ← Server-side Fernet key escrow engine
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
| `phone` | CharField | Phone number (indexed) |
| `is_active` | BooleanField | False = deactivated account, all JWTs rejected |
| `is_staff` | BooleanField | True = allows access to `/admin/` portal |
| `otp_code` | CharField(6) | Current active OTP (set to NULL after use) |
| `otp_expires_at` | DateTimeField | OTP expiry window (5 minutes from generation) |
| `tfa_enabled` | BooleanField | Per-user 2FA toggle (independent of global OTP_ENABLED setting) |
| `encrypted_vault_key` | TextField | Admin's master key, encrypted with their password |
| `recovery_encrypted_vault_key` | TextField | Master key encrypted with user's Emergency Rescue Kit key |
| `escrow_encrypted_vault_key` | TextField | Server-side Fernet-encrypted copy of vault key for emergency reset |
| `date_joined` | DateTimeField | Immutable creation timestamp (`auto_now_add=True`) |

---

### 7.5 Soft Deletion Architecture

To prevent irreversible data loss when credentials or school entities are deleted, the system implements soft deletion via `SoftDeleteQuerySet` and `SoftDeleteManager`:

- Models `EncryptedBank` and `Entity` contain `is_deleted = BooleanField(default=False)` and `deleted_at = DateTimeField(null=True)`.
- Standard queries (`objects.all()`) filter out soft-deleted records (`alive_only=True`).
- Calling `.delete()` on an instance or QuerySet flags `is_deleted=True` and records timestamp instead of executing SQL `DELETE`.
- Super Admins can restore soft-deleted items via `POST /api/v1/vault/<uuid>/restore/` and `POST /api/v1/entities/<uuid>/restore/`.

---

### 7.6 Redis In-Memory Caching & Cache Invalidation

Entity listings are cached in Redis to minimize database query latency:
- Key `entities_list` caches entity listings for 15 minutes (900s).
- CRUD operations (Create, Update, Soft Delete, Restore) automatically trigger `_invalidate_entities_cache()`.

---

### 7.7 Celery Asynchronous Task Queue

To prevent blocking WSGI worker threads during SMTP email dispatches:
- Celery worker queue is configured via `vault_backend/celery.py`.
- `@shared_task` asynchronous handler `send_security_alert_task` in `tasks.py` handles email alerts in the background.

---

### 7.8 Native `createsuperuser` CLI Integration

The custom `AdminManager.create_user` method handles both web-derived `loginHashHex` and raw CLI passwords from `python manage.py createsuperuser`:
- Automatically detects non-hex raw passwords.
- Derives `loginHashHex` using SHA-256 PBKDF2 (600k iterations).
- Automatically generates and encrypts `encrypted_vault_key` using `SECRET_KEY` so CLI-created superusers can log into the web UI without encryption errors.

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
**Pagination:** Global `StandardResultsSetPagination` returning `{ "count": N, "next": url, "previous": url, "results": [...] }` (page size: 50, max: 200).

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
| `POST` | `/auth/password-reset/escrow-key/` | None | Returns Fernet-decrypted escrow vault key after OTP verification (emergency fallback). |
| `POST` | `/auth/password-reset/verify/` | None | Verifies OTP, sets new password, updates `encrypted_vault_key` & `recovery_encrypted_vault_key`. |
| `POST` | `/auth/vault/escrow-sync/` | JWT | Syncs client vault key to server-side Fernet key escrow engine. |
| `POST` | `/auth/email-change/` | JWT | Sends OTP to new email address for verification. |
| `POST` | `/auth/email-change/verify/` | JWT | Verifies OTP and updates admin's email address. |
| `POST` | `/auth/tfa/toggle/` | JWT | Enables or disables 2FA for the current admin. |
| `GET` | `/auth/profile/` | JWT | Returns current admin's profile data. |
| `PATCH` | `/auth/profile/` | JWT | Updates current admin's profile (name, dept, campus, designation, phone). |
| `POST` | `/auth/reset-database/` | JWT (Level 3) | Factory reset: destroys bank credentials, entities, and activity logs. |

#### Rate Limiting on Auth Endpoints

All auth endpoints (`/auth/login/`, `/auth/login/verify/`, `/auth/password-reset/`) are rate-limited to **5 requests per minute per IP** via `ScopedRateThrottle`.

### 8.2 Vault (Bank Credentials) APIs

| Method | Endpoint | Min Level | Description |
|--------|----------|-----------|-------------|
| `GET` | `/vault/` | Level 1 | List all bank credential records (returns ciphertexts, paginated). |
| `POST` | `/vault/` | Level 3 | Create new bank credential (receives ciphertexts from client). |
| `GET` | `/vault/<uuid>/` | Level 1 | Get single bank record. Logs access to ActivityLog. |
| `PUT`/`PATCH` | `/vault/<uuid>/` | Level 2 | Update bank record fields. |
| `DELETE` | `/vault/<uuid>/` | Level 3 | Soft delete bank record (`is_deleted=True`). |
| `POST` | `/vault/<uuid>/restore/` | Level 3 | Restore soft-deleted bank record. |

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
| `GET` | `/entities/` | Level 1 | List all registered entities (cached in Redis). |
| `POST` | `/entities/` | Level 3 | Register single entity. |
| `GET` | `/entities/<uuid>/` | Level 1 | Get single entity. |
| `DELETE` | `/entities/<uuid>/` | Level 3 | Soft delete entity (`is_deleted=True`). |
| `POST` | `/entities/<uuid>/restore/` | Level 3 | Restore soft-deleted entity. |
| `POST` | `/entities/bulk/` | Level 3 | Bulk register multiple entities atomically. |

### 8.5 Audit Log API

| Method | Endpoint | Min Level | Description |
|--------|----------|-----------|-------------|
| `GET` | `/audit-logs/` | Level 2 | Returns all activity log entries, newest first (B-Tree indexed). |

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
| `name` | VARCHAR | Display name (Indexed: `admin_name_idx`) |
| `password` | VARCHAR | Argon2id hash of `loginHashHex` |
| `level` | INTEGER | RBAC level: 1, 2, or 3 |
| `dept` | VARCHAR | Department |
| `campus` | VARCHAR | Campus/branch |
| `designation` | VARCHAR | Job title |
| `phone` | VARCHAR | Phone number |
| `is_active` | BOOLEAN | False = deactivated account (Indexed: `admin_is_active_idx`) |
| `is_staff` | BOOLEAN | True = Django Admin portal access |
| `is_superuser` | BOOLEAN | True = all Django permissions |
| `otp_code` | VARCHAR(6) | Current active OTP (NULL when not active) |
| `otp_expires_at` | TIMESTAMP | OTP expiry time |
| `tfa_enabled` | BOOLEAN | Per-user 2FA toggle |
| `encrypted_vault_key` | TEXT | Master key encrypted with admin's password |
| `recovery_encrypted_vault_key` | TEXT | Master key encrypted with Emergency Rescue Kit key |
| `escrow_encrypted_vault_key` | TEXT | Server-side Fernet-encrypted vault key for OTP-only reset |
| `date_joined` | TIMESTAMP | Immutable creation timestamp |

### EncryptedBank Table (`vault_api_encryptedbank`)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID PK | Unguessable primary key |
| `entity_id` | UUID FK | Associated entity (school branch), CASCADE on delete |
| `name` | VARCHAR | Bank name (e.g., "HDFC Bank") — plaintext (Indexed: `bank_name_idx`) |
| `initial` | VARCHAR(5) | Abbreviation (e.g., "HDFC") — plaintext |
| `color` | VARCHAR(7) | UI card hex color — plaintext |
| `account_type` | VARCHAR | "retail" or "corporate" — plaintext (Indexed: `bank_account_type_idx`) |
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

## 12. Rate Limiting, Security Headers & Connection Pooling

### Rate Limiting

```python
'DEFAULT_THROTTLE_RATES': {
    'anon': '100/day',     # Unauthenticated IPs: 100 requests/day
    'user': '1000/day',    # Authenticated admins: 1000 requests/day
    'login': '5/minute',   # Login, OTP, password reset: 5 attempts/minute
}
```

### Database Connection Pooling

```python
DATABASES = {
    'default': {
        ...
        'CONN_MAX_AGE': 600,         # Persist database connections for 10 minutes
        'CONN_HEALTH_CHECKS': True,  # Verify DB connection health before re-use
    }
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
| `REDIS_URL` | No | `redis://redis:6379/1` | Redis connection URL for caching & Celery |
| `CELERY_BROKER_URL` | No | `redis://redis:6379/0` | Celery async worker message broker URL |
| `VAULT_ESCROW_KEY` | No | Fernet 32-byte key | Master key for server-side key escrow unwrap |
| `ESCROW_MASTER_SALT` | No | 32-char hex string | Salt used to derive Fernet escrow key |
| `SENTRY_DSN` | No | `https://...` | Sentry performance monitoring & exception logging DSN |
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
| Generate Emergency Rescue Kit | ✅ | ✅ | ✅ |
| Update own profile | ✅ | ✅ | ✅ |
| Change own email | ✅ | ✅ | ✅ |
| Edit bank credentials | ❌ | ✅ | ✅ |
| View activity audit logs | ❌ | ✅ | ✅ |
| Add new bank accounts | ❌ | ❌ | ✅ |
| Delete bank accounts (Soft Delete) | ❌ | ❌ | ✅ |
| Restore soft-deleted bank accounts | ❌ | ❌ | ✅ |
| Register entities (single) | ❌ | ❌ | ✅ |
| Register entities (bulk) | ❌ | ❌ | ✅ |
| Delete entities (Soft Delete) | ❌ | ❌ | ✅ |
| Restore soft-deleted entities | ❌ | ❌ | ✅ |
| Register new admins | ❌ | ❌ | ✅ |
| Delete/deactivate admins | ❌ | ❌ | ✅ |
| Reset entire database | ❌ | ❌ | ✅ |

---

## 17. Setup, Docker & CI/CD Deployment

### 17.1 Local Development Setup

#### Prerequisites
- Python 3.11+
- Node.js 18+ and npm
- PostgreSQL 15+ & Redis

#### Backend Setup

```bash
# 1. Navigate to backend directory
cd vault_backend

# 2. Create and activate virtual environment
python -m venv venv
venv\Scripts\activate           # Windows
# source venv/bin/activate      # macOS/Linux

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run database migrations
python manage.py migrate

# 5. Create first Super Admin
python manage.py createsuperuser

# 6. Start Celery worker (in separate terminal)
celery -A vault_backend worker --loglevel=info

# 7. Start backend server
python manage.py runserver
```

#### Frontend Setup

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

---

### 17.2 Docker Compose Multi-Container Deployment

Production stack orchestration is configured via [docker-compose.yml](file:///c:/Users/premc/Downloads/Password-Module/docker-compose.yml):

```bash
# Build and launch all services in detached mode
docker-compose up --build -d
```

**Services Orchestrated:**
- `web`: Django WSGI running under Gunicorn on port `8000`.
- `db`: PostgreSQL 15 database container with persistent volume.
- `redis`: Redis 7 in-memory cache & Celery message broker.
- `celery`: Background worker process processing async tasks.

---

### 17.3 Automated CI/CD Pipeline

Continuous Integration is managed via GitHub Actions [.github/workflows/ci.yml](file:///c:/Users/premc/Downloads/Password-Module/.github/workflows/ci.yml):
- Triggers on all pushes and PRs to `main`.
- Runs `python manage.py check` and Django unit test suites.
- Executes `npm run build` to verify production frontend bundler integrity.

---

### 17.4 Accessing the System

| URL | Description |
|-----|-------------|
| `http://localhost:5173` | React frontend application |
| `http://127.0.0.1:8000/admin/` | Django Admin portal |
| `http://127.0.0.1:8000/api/v1/` | DRF API browser root |

---

*Document updated for South Point School Security Terminal — Password Module v1.0*  
*© 2026 South Point School. Guwahati, Assam, India.*
