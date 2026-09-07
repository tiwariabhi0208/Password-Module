import uuid
import re
from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.core.validators import MaxLengthValidator, validate_email
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin


class SoftDeleteQuerySet(models.QuerySet):
    def delete(self):
        return super().update(is_deleted=True, deleted_at=timezone.now())

    def hard_delete(self):
        return super().delete()

    def alive(self):
        return self.filter(is_deleted=False)

    def dead(self):
        return self.filter(is_deleted=True)


class SoftDeleteManager(models.Manager):
    def __init__(self, *args, **kwargs):
        self.alive_only = kwargs.pop('alive_only', True)
        super().__init__(*args, **kwargs)

    def get_queryset(self):
        if self.alive_only:
            return SoftDeleteQuerySet(self.model, using=self._db).filter(is_deleted=False)
        return SoftDeleteQuerySet(self.model, using=self._db)

    def hard_delete(self):
        return self.get_queryset().hard_delete()



class AdminManager(BaseUserManager):

    def create_user(self, email, name, password=None, level=1, **extra_fields):
        # Step 1: Validate that email is provided
        if not email:
            raise ValueError("Admins must have an email address")

        # Step 2: Normalise the email (lowercase the domain part)
        # This prevents Admin@GMAIL.COM and admin@gmail.com from being two different accounts
        email = self.normalize_email(email)

        # Step 3: Build the model instance (does NOT save to DB yet)
        user = self.model(email=email, name=name, level=level, **extra_fields)

        # Step 4: Hash the password using Argon2id and store the hash
        # set_password() NEVER stores the plaintext. It stores the hash.
        user.set_password(password)

        # Step 5: Save to the database
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, password=None, **extra_fields):
        # This is called by: python manage.py createsuperuser
        # It forces is_staff=True and is_superuser=True and level=3
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, name, password, level=3, **extra_fields)


class Admin(AbstractBaseUser, PermissionsMixin):
    # These are the valid choices for the 'level' field
    # Stored as integers in the DB for efficiency, displayed as strings in the UI
    LEVEL_CHOICES = (
        (1, 'Level 1 - Read Only'),
        (2, 'Level 2 - Limited Access'),
        (3, 'Level 3 - Super Admin'),
    )

    # UUID primary key -- unguessable, unlike auto-increment integers
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # The login identifier -- must be unique across all admin accounts
    email = models.EmailField(unique=True, max_length=255)

    # The original email used during registration -- used for generating the salt stably
    original_email = models.EmailField(max_length=255, blank=True, null=True)

    # Display name -- not unique, just for the UI
    name = models.CharField(max_length=255)

    # The clearance level -- determines what the admin can do
    level = models.IntegerField(choices=LEVEL_CHOICES, default=1)

    # Optional profile fields -- blank=True means the form does not require them
    dept = models.CharField(max_length=255, blank=True)
    campus = models.CharField(max_length=255, blank=True)
    designation = models.CharField(max_length=255, blank=True)
    phone = models.CharField(max_length=15, blank=True)

    # is_active=False means the admin is deactivated -- their JWT will be rejected
    is_active = models.BooleanField(default=True)

    # is_staff=True means the admin can access /admin/ -- we control this separately from level
    is_staff = models.BooleanField(default=False)

    # OTP verification fields for 2FA login
    otp_code = models.CharField(max_length=6, blank=True, null=True)
    otp_expires_at = models.DateTimeField(blank=True, null=True)
    tfa_enabled = models.BooleanField(default=False)
    encrypted_vault_key = models.TextField(blank=True, null=True)
    recovery_encrypted_vault_key = models.TextField(blank=True, null=True)

    # auto_now_add=True: Django sets this once when the record is created, never changes it
    date_joined = models.DateTimeField(auto_now_add=True)

    # Connect the custom manager we wrote above
    objects = AdminManager()

    # Tell Django's auth system to use 'email' as the login identifier, not 'username'
    USERNAME_FIELD = 'email'

    # These fields are asked for when running: python manage.py createsuperuser
    REQUIRED_FIELDS = ['name']

    def __str__(self):
        # This is what shows in the admin panel list view
        return f"{self.name} ({self.get_level_display()})"

    def save(self, *args, **kwargs):
        if not self.original_email:
            self.original_email = self.email
        super().save(*args, **kwargs)

    class Meta:
        indexes = [
            models.Index(fields=['name'], name='admin_name_idx'),
            models.Index(fields=['is_active'], name='admin_is_active_idx'),
        ]



class EncryptedBank(models.Model):
    ACCOUNT_TYPE_CHOICES = (
        ('retail', 'Retail'),
        ('corporate', 'Corporate'),
    )

    # UUID primary key -- unguessable, same reason as Admin model
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Relationship linking the bank account to a specific organizational entity
    entity = models.ForeignKey(
        'Entity',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='bank_accounts'
    )

    # --- PLAINTEXT FIELDS (safe to store unencrypted) ---
    # These are UI metadata. You need them to display the card without decrypting.
    # An attacker knowing "HDFC Bank - Main Branch" cannot access the bank account.
    name = models.CharField(max_length=255)       # e.g. "HDFC Bank"
    initial = models.CharField(max_length=5)      # e.g. "HDFC"
    color = models.CharField(max_length=7, default="#7B1535")  # Hex color for the card UI
    account_type = models.CharField(max_length=15, choices=ACCOUNT_TYPE_CHOICES, default='corporate')
    branch_name = models.CharField(max_length=255, blank=True)

    # --- ENCRYPTED FIELDS (AES-256-GCM ciphertexts, never plaintext) ---
    # Each value is: base64( [12-byte random IV] + [ciphertext] + [16-byte auth tag] )
    # The server receives these already encrypted and stores them as-is.
    # The server is completely unable to read what these contain.
    encrypted_holder = models.TextField()
    encrypted_account_number = models.TextField()
    encrypted_ifsc = models.TextField()
    encrypted_username = models.TextField()
    encrypted_password = models.TextField()
    encrypted_transaction_password = models.TextField(blank=True, null=True)

    # Photo stored as base64 text -- capped at 1MB to prevent disk flooding (DoS)
    photo_payload = models.TextField(
        blank=True,
        null=True,
        validators=[MaxLengthValidator(1_048_576)]  # 1,048,576 characters ~ 1MB of base64
    )

    created_at = models.DateTimeField(auto_now_add=True)  # Set once on INSERT, never changes
    updated_at = models.DateTimeField(auto_now=True)      # Updated on every SAVE automatically

    # Soft deletion fields
    is_deleted = models.BooleanField(default=False, db_index=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    objects = SoftDeleteManager()
    all_objects = SoftDeleteManager(alive_only=False)

    def delete(self, using=None, keep_parents=False):
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save(update_fields=['is_deleted', 'deleted_at'])

    def hard_delete(self):
        super().delete()

    def restore(self):
        self.is_deleted = False
        self.deleted_at = None
        self.save(update_fields=['is_deleted', 'deleted_at'])

    def __str__(self):
        return f"{self.name} - Account ending in ...{self.id.hex[-4:]}"

    class Meta:
        indexes = [
            models.Index(fields=['-created_at'], name='bank_created_at_idx'),
            models.Index(fields=['name'], name='bank_name_idx'),
            models.Index(fields=['account_type'], name='bank_account_type_idx'),
            models.Index(fields=['entity', '-created_at'], name='bank_entity_created_idx'),
            models.Index(fields=['is_deleted'], name='bank_is_deleted_idx'),
        ]




class ActivityLog(models.Model):
    LOG_TYPE_CHOICES = (
        ('success', 'Success'),
        ('info', 'Info'),
        ('warning', 'Warning'),
        ('error', 'Error'),
    )

    # Timestamp set once on creation -- can never be edited
    # This immutability is what makes audit logs trustworthy.
    # You cannot backdate a log entry because auto_now_add locks this field.
    timestamp = models.DateTimeField(auto_now_add=True)

    # Short label: "Login Attempt", "Vault Export", "Record Deleted"
    action = models.CharField(max_length=255)

    # Full description: "Admin exported vault to JSON backup from IP 103.21.4.5"
    details = models.TextField()

    # ForeignKey to Admin -- this is the secure way to record who did the action.
    # The database enforces this points to a real, existing Admin UUID.
    # No code can fake this by writing a string -- it must be an actual Admin object.
    # on_delete=SET_NULL: if the Admin is deleted, preserve the log (set FK to NULL)
    # CASCADE would delete the log too -- destroying your audit trail entirely
    user = models.ForeignKey(
        'Admin',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='activity_logs',
        db_index=True  # Index for fast queries: "show all logs by admin X"
    )

    # String snapshot of the admin's name at the time of the action.
    # Even after the admin account is deleted (user FK becomes NULL),
    # you can still read exactly who performed this action.
    user_snapshot = models.CharField(max_length=255)

    # Category for UI color-coding and filtering
    log_type = models.CharField(max_length=15, choices=LOG_TYPE_CHOICES, default='info')

    # IP address the action came from
    # GenericIPAddressField validates both IPv4 and IPv6 -- a CharField would accept garbage
    ip_address = models.GenericIPAddressField(blank=True, null=True)

    def __str__(self):
        return f"{self.timestamp} | {self.action} | {self.user_snapshot}"

    class Meta:
        indexes = [
            models.Index(fields=['-timestamp'], name='log_timestamp_idx'),
            models.Index(fields=['action'], name='log_action_idx'),
            models.Index(fields=['log_type'], name='log_type_idx'),
            models.Index(fields=['user', '-timestamp'], name='log_user_ts_idx'),
        ]



class Entity(models.Model):
    # UUID primary key -- unguessable
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True, max_length=255)
    phone = models.CharField(max_length=15, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    # Soft deletion fields
    is_deleted = models.BooleanField(default=False, db_index=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    objects = SoftDeleteManager()
    all_objects = SoftDeleteManager(alive_only=False)

    def delete(self, using=None, keep_parents=False):
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save(update_fields=['is_deleted', 'deleted_at'])

    def hard_delete(self):
        super().delete()

    def restore(self):
        self.is_deleted = False
        self.deleted_at = None
        self.save(update_fields=['is_deleted', 'deleted_at'])

    class Meta:
        indexes = [
            models.Index(fields=['name'], name='entity_name_idx'),
            models.Index(fields=['-created_at'], name='entity_created_idx'),
            models.Index(fields=['is_deleted'], name='entity_is_deleted_idx'),
        ]



    def __str__(self):
        return f"{self.name} ({self.email})"

    def clean(self):
        # 1. Validate email
        if self.email:
            try:
                validate_email(self.email)
            except ValidationError:
                raise ValidationError({'email': "Email must be a valid email address."})

        # 2. Validate phone is exactly 10 digits
        if self.phone:
            phone_clean = re.sub(r'\D', '', self.phone)
            if len(phone_clean) != 10:
                raise ValidationError({'phone': "Phone number must be exactly 10 digits."})
            self.phone = phone_clean

    def save(self, *args, **kwargs):
        self.full_clean()  # Force model-level validation (e.g. clean) before saving
        super().save(*args, **kwargs)

