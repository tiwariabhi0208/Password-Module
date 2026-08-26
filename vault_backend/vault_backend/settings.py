import os
from datetime import timedelta
from pathlib import Path
from dotenv import load_dotenv

# ============================================================
# Section 1: Loading Environment Variables
# ============================================================
load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# ============================================================
# Section 2: The Secret Key -- The Master Signing Key
# ============================================================
# SECURITY: Raises KeyError immediately on startup if SECRET_KEY is not set.
# Never provide a fallback default -- fail loudly rather than run with a weak key.
# Generate a key with: python -c "import secrets; print(secrets.token_hex(64))"
SECRET_KEY = os.environ['SECRET_KEY']
if len(SECRET_KEY) < 50:
    raise ValueError("SECRET_KEY is too short. Regenerate with secrets.token_hex(64).")

DEBUG = os.environ.get('DEBUG', 'False') == 'True'  # NEVER set this to True in production
ALLOWED_HOSTS = ['api.yourvaultdomain.com', '127.0.0.1', 'localhost']

# ============================================================
# Section 3: Telling Django to Use Your Custom User Model
# ============================================================
AUTH_USER_MODEL = 'vault_api.Admin'

# ============================================================
# Section 4: Password Hashing -- Argon2id
# ============================================================
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.Argon2PasswordHasher',   # Primary -- used for all NEW passwords
    'django.contrib.auth.hashers.PBKDF2PasswordHasher',   # Fallback -- for any old PBKDF2 hashes
]

# ============================================================
# Section 5: Installed Apps
# ============================================================
INSTALLED_APPS = [
    # Django built-in apps
    'django.contrib.admin',        # The /admin/ panel
    'django.contrib.auth',         # Core authentication framework
    'django.contrib.contenttypes', # Tracks model types -- needed by permissions system
    'django.contrib.sessions',     # Session storage (we use JWT but admin panel needs this)
    'django.contrib.messages',     # Flash messages for the admin panel
    'django.contrib.staticfiles',  # Static file serving (CSS/JS for /admin/)

    # Third-party packages we installed
    'rest_framework',                          # DRF -- JSON API framework
    'rest_framework_simplejwt.token_blacklist', # JWT blacklist table for logout
    'corsheaders',                             # CORS headers for React frontend

    # Our application
    'vault_api',
]

# ============================================================
# Section 6: Middleware and Why CorsMiddleware Must Be First
# ============================================================
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',           # MUST be first -- explained below
    'django.middleware.security.SecurityMiddleware',   # Adds HTTPS redirect and security headers
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',       # CSRF protection
    'django.contrib.auth.middleware.AuthenticationMiddleware', # Attaches user to request
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',  # X-Frame-Options header
]

ROOT_URLCONF = 'vault_backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'vault_backend.wsgi.application'

# ============================================================
# Database Configuration
# ============================================================
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME', 'vault_db'),
        'USER': os.environ.get('DB_USER', 'vault_user'),
        'PASSWORD': os.environ.get('DB_PASSWORD', ''),
        'HOST': os.environ.get('DB_HOST', 'localhost'),
        'PORT': os.environ.get('DB_PORT', '5432'),
    }
}

# ============================================================
# Section 7: CORS Configuration
# ============================================================
# Environment-gated -- never mix http:// and https:// in the same list
if DEBUG:
    CORS_ALLOWED_ORIGINS = [
        "http://localhost:5173",  # Vite React dev server
    ]
else:
    CORS_ALLOWED_ORIGINS = [
        "https://yourvaultdomain.com",  # Production -- HTTPS only, no http://
    ]

CORS_ALLOW_CREDENTIALS = True  # Required to allow HttpOnly cookies to be sent

# ============================================================
# Section 8: DRF Settings and Rate Limiting
# ============================================================
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',  # Rate limit for unauthenticated users
        'rest_framework.throttling.UserRateThrottle',  # Rate limit for authenticated users
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/day',    # An unauthenticated IP can make 100 requests per day
        'user': '1000/day',   # An authenticated admin can make 1000 requests per day
        'login': '5/minute',  # The login endpoint specifically: max 5 attempts per minute
    }
}

# ============================================================
# Section 9: JWT Settings (SIMPLE_JWT)
# ============================================================
SIMPLE_JWT = {
    # Access token lives 15 minutes.
    # Short lifetime limits damage if a token is stolen.
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),

    # Refresh token lives 7 days.
    # Used only to get new access tokens, not to make API calls directly.
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),

    # When a refresh token is used, issue a new one and blacklist the old one.
    # If a stolen refresh token is used after the legitimate user already used it,
    # the stolen copy is already blacklisted.
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,

    # The Authorization header format: "Authorization: Bearer <token>"
    'AUTH_HEADER_TYPES': ('Bearer',),

    # Cookie configuration for the refresh token
    'AUTH_COOKIE': 'refresh_token',              # The cookie name
    'AUTH_COOKIE_SECURE': True,                  # Only sent over HTTPS -- never over HTTP
    'AUTH_COOKIE_HTTP_ONLY': True,               # JavaScript cannot read this cookie at all
    'AUTH_COOKIE_PATH': '/api/v1/auth/refresh/', # CRITICAL: cookie only sent to this URL
    'AUTH_COOKIE_SAMESITE': 'Strict',            # Never sent from a different domain
}

# ============================================================
# Section 10: HTTPS and Security Headers
# ============================================================
# Forces all HTTP requests to redirect to HTTPS
SECURE_SSL_REDIRECT = not DEBUG

# Cookies are only sent over HTTPS connections
SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG

# Prevents browsers from guessing (sniffing) file types -- stops script-disguised-as-image attacks
SECURE_CONTENT_TYPE_NOSNIFF = True

# Prevents your site from being loaded inside an <iframe> -- stops clickjacking
X_FRAME_OPTIONS = 'DENY'

# Legacy XSS filter for older browsers
SECURE_BROWSER_XSS_FILTER = True

# HSTS: tells browsers to ONLY use HTTPS for this domain for the next year
# After a user visits once over HTTPS, their browser will refuse HTTP for 365 days
# WARNING: Only enable this after HTTPS is fully working. If your certificate expires
# and HSTS is on, users cannot access your site at all for a year.
SECURE_HSTS_SECONDS = 31536000        # 365 days in seconds
SECURE_HSTS_INCLUDE_SUBDOMAINS = True  # Apply HSTS to all subdomains too
SECURE_HSTS_PRELOAD = True             # Submit to browser preload lists (optional but good)

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.0/howto/static-files/
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'static'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Internationalization
# https://docs.djangoproject.com/en/5.0/topics/i18n/
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True
