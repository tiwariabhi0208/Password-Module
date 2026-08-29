import re
from rest_framework import serializers
from .models import Admin, EncryptedBank, ActivityLog, Entity

class AdminSerializer(serializers.ModelSerializer):
    """
    Serializer for the Admin model.
    Exposes profile fields but excludes sensitive credentials (like the password hash).
    """
    class Meta:
        model = Admin
        fields = ('id', 'email', 'name', 'level', 'dept', 'campus', 'designation', 'phone', 'is_active', 'date_joined', 'tfa_enabled')
        read_only_fields = ('id', 'date_joined')


class AdminProfileUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for an admin editing their OWN profile (self-service).
    Deliberately excludes 'level', 'is_active' and 'email' -- a level-1 admin must
    never be able to promote themselves or reactivate/deactivate their own account.
    Email changes go through the dedicated OTP-verified EmailChange flow instead.
    """
    class Meta:
        model = Admin
        fields = ('name', 'dept', 'campus', 'designation', 'phone')

    def validate_phone(self, value):
        if not value:
            return value
        phone_clean = re.sub(r'\D', '', value)
        if len(phone_clean) != 10:
            raise serializers.ValidationError("Phone number must be exactly 10 digits.")
        return phone_clean


class AdminCreateSerializer(serializers.ModelSerializer):
    """
    Serializer specifically for registering new Admin users.
    Ensures passwords are submitted securely and hashed via Argon2id through the custom manager.
    """
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = Admin
        fields = ('email', 'name', 'password', 'level', 'dept', 'campus', 'designation', 'phone')

    def create(self, validated_data):
        # Uses the custom create_user method in AdminManager which handles Argon2id hashing
        return Admin.objects.create_user(**validated_data)


class EncryptedBankSerializer(serializers.ModelSerializer):
    """
    Serializer for the EncryptedBank credential storage.
    Enforces validation on metadata fields and securely receives base64-encoded encrypted fields.
    """
    class Meta:
        model = EncryptedBank
        fields = (
            'id', 'entity', 'name', 'initial', 'color', 'account_type', 'branch_name',
            'encrypted_holder', 'encrypted_account_number', 'encrypted_ifsc',
            'encrypted_username', 'encrypted_password', 'encrypted_transaction_password',
            'photo_payload', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')


class ActivityLogSerializer(serializers.ModelSerializer):
    """
    Serializer for reading ActivityLog entries.
    All fields are read-only as audit logs must be immutable.
    """
    class Meta:
        model = ActivityLog
        fields = ('id', 'timestamp', 'action', 'details', 'user', 'user_snapshot', 'log_type', 'ip_address')
        read_only_fields = fields


class EntitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Entity
        fields = ('id', 'name', 'email', 'phone', 'created_at')
        read_only_fields = ('id', 'created_at')
