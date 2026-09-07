from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    LoginView, LoginVerifyView, LogoutView, CustomTokenRefreshView,
    EncryptedBankViewSet, ActivityLogListView, SaltView,
    PasswordResetRequestView, PasswordResetConfirmView, PasswordResetKeyView,
    VaultEscrowSyncView, PasswordResetEscrowKeyView,
    EmailChangeRequestView, EmailChangeConfirmView, TfaToggleView,
    DatabaseResetView, EntityViewSet, AdminProfileView, AdminViewSet
)

router = DefaultRouter()
# Automatically creates routes:
# GET /api/v1/vault/ -> list
# POST /api/v1/vault/ -> create
# GET /api/v1/vault/<id>/ -> retrieve
# PUT/PATCH /api/v1/vault/<id>/ -> update
# DELETE /api/v1/vault/<id>/ -> destroy
router.register(r'vault', EncryptedBankViewSet, basename='vault')
router.register(r'entities', EntityViewSet, basename='entities')
router.register(r'admins', AdminViewSet, basename='admins')

urlpatterns = [
    # Auth Endpoints
    path('auth/salt/', SaltView.as_view(), name='auth_salt'),
    path('auth/login/', LoginView.as_view(), name='auth_login'),
    path('auth/login/verify/', LoginVerifyView.as_view(), name='auth_login_verify'),
    path('auth/logout/', LogoutView.as_view(), name='auth_logout'),
    path('auth/refresh/', CustomTokenRefreshView.as_view(), name='auth_token_refresh'),
    path('auth/password-reset/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('auth/password-reset/verify/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('auth/password-reset/key/', PasswordResetKeyView.as_view(), name='password_reset_key'),
    path('auth/password-reset/escrow-key/', PasswordResetEscrowKeyView.as_view(), name='password_reset_escrow_key'),
    path('auth/vault/escrow-sync/', VaultEscrowSyncView.as_view(), name='vault_escrow_sync'),
    path('auth/email-change/', EmailChangeRequestView.as_view(), name='email_change_request'),
    path('auth/email-change/verify/', EmailChangeConfirmView.as_view(), name='email_change_confirm'),
    path('auth/tfa/toggle/', TfaToggleView.as_view(), name='tfa_toggle'),
    path('auth/profile/', AdminProfileView.as_view(), name='auth_profile'),
    path('auth/reset-database/', DatabaseResetView.as_view(), name='reset_database'),

    # Audit Logs
    path('audit-logs/', ActivityLogListView.as_view(), name='audit_logs'),

    # Include viewsets
    path('', include(router.urls)),
]
