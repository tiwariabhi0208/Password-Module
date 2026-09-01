import hashlib
import hmac
from django.conf import settings
from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model

Admin = get_user_model()


class VaultAuthBackend(ModelBackend):
    """
    Custom authentication backend for Vault Admin.
    Allows authentication via both:
    1. Direct password hash matching (when password parameter is already the client-side derived loginHashHex)
    2. Plaintext password derivation (when logging in via Django Admin panel /admin/ using raw plaintext password)
    """

    def authenticate(self, request, username=None, password=None, **kwargs):
        email = username or kwargs.get('email')
        if not email or not password:
            return None

        email_clean = email.strip().lower()
        try:
            user = Admin.objects.get(email__iexact=email_clean)
        except Admin.DoesNotExist:
            return None

        # 1. Direct password check (password is loginHashHex or direct plaintext matching stored hash)
        if user.check_password(password):
            if self.user_can_authenticate(user):
                return user

        # 2. Try client-side PBKDF2 derivation if password is raw plaintext typed in Django Admin panel
        try:
            key = settings.SECRET_KEY.encode('utf-8')
            msg = email_clean.encode('utf-8')
            salt_hex = hmac.new(key, msg, hashlib.sha256).hexdigest()[:32]
            salt_bytes = bytes.fromhex(salt_hex)

            derived_64 = hashlib.pbkdf2_hmac(
                'sha256',
                password.encode('utf-8'),
                salt_bytes,
                600000,
                64
            )
            login_hash_hex = derived_64[32:].hex()

            if user.check_password(login_hash_hex):
                if self.user_can_authenticate(user):
                    return user
        except Exception:
            pass

        return None
