from django.contrib import admin
from .models import Admin, EncryptedBank, ActivityLog


@admin.register(Admin)
class AdminUserAdmin(admin.ModelAdmin):
    # Columns displayed in the list view
    list_display = ('email', 'name', 'level', 'dept', 'is_active', 'is_staff')
    # Filter sidebar on the right
    list_filter = ('level', 'dept', 'is_active')
    # Search box at the top -- searches these fields
    search_fields = ('email', 'name', 'dept')
    # Default sort order
    ordering = ('email',)


@admin.register(EncryptedBank)
class EncryptedBankAdmin(admin.ModelAdmin):
    list_display = ('name', 'account_type', 'branch_name', 'created_at')
    list_filter = ('account_type',)
    search_fields = ('name', 'branch_name')

    # Encrypted fields are read-only in admin.
    # If a Django admin edits these and saves garbled text, the record is permanently corrupted.
    # The browser encrypted these -- only the browser can meaningfully edit them.
    readonly_fields = (
        'encrypted_holder',
        'encrypted_account_number',
        'encrypted_ifsc',
        'encrypted_username',
        'encrypted_password',
        'encrypted_transaction_password',
    )


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ('timestamp', 'action', 'user_snapshot', 'log_type', 'ip_address')
    list_filter = ('log_type',)
    search_fields = ('action', 'user_snapshot', 'details')

    # Every field is read-only -- logs are immutable records
    readonly_fields = ('timestamp', 'action', 'details', 'user', 'user_snapshot', 'log_type', 'ip_address')

    # Remove the ability to create, edit, or delete log entries from the admin panel.
    # Audit logs must be tamper-proof. Even a superuser should not be able to delete logs.
    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        # Allow superusers to delete logs when resetting database
        return request.user.is_superuser
