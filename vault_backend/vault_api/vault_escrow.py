"""
Server-side escrow for vault keys.

Normally the raw vault key is only ever known to the browser -- the server just stores
it encrypted under a key derived from the admin's master password (or their Recovery
Key), and never sees the plaintext. That's the zero-knowledge guarantee.

This module deliberately breaks that guarantee for one recovery path: an OTP-verified
password reset where the admin has neither their old password nor their Recovery Key.
Instead of losing the vault permanently, the browser sends the raw vault key here once
(over HTTPS, while already authenticated) and it gets wrapped with a key only the
server holds (VAULT_ESCROW_KEY). A later OTP-verified reset can unwrap it.

If VAULT_ESCROW_KEY is not configured, escrow is treated as disabled everywhere.
"""
from cryptography.fernet import Fernet, InvalidToken
from django.conf import settings


def escrow_enabled() -> bool:
    return bool(settings.VAULT_ESCROW_KEY)


def _fernet() -> Fernet:
    return Fernet(settings.VAULT_ESCROW_KEY.encode())


def encrypt_vault_key_escrow(vault_key_hex: str) -> str:
    """Wraps a raw vault key (hex string) for server-side storage."""
    return _fernet().encrypt(vault_key_hex.encode()).decode()


def decrypt_vault_key_escrow(token: str) -> str:
    """Unwraps a stored escrow token back into the raw vault key (hex string).

    Raises InvalidToken if the token is malformed or was encrypted under a different key
    (e.g. VAULT_ESCROW_KEY was rotated).
    """
    return _fernet().decrypt(token.encode()).decode()


__all__ = ["escrow_enabled", "encrypt_vault_key_escrow", "decrypt_vault_key_escrow", "InvalidToken"]
