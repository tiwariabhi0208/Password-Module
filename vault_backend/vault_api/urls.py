from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    LoginView, LoginVerifyView, LogoutView, CustomTokenRefreshView,
    EncryptedBankViewSet, ActivityLogListView, SaltView,
    PasswordResetRequestView, PasswordResetConfirmView,
    EmailChangeRequestView, EmailChangeConfirmView, TfaToggleView,
    DatabaseResetView
)

router = DefaultRouter()
# Automatically creates routes:
# GET /api/v1/vault/ -> list
# POST /api/v1/vault/ -> create
# GET /api/v1/vault/<id>/ -> retrieve
# PUT/PATCH /api/v1/vault/<id>/ -> update
# DELETE /api/v1/vault/<id>/ -> destroy
router.register(r'vault', EncryptedBankViewSet, basename='vault')

urlpatterns = [
    # Auth Endpoints
    path('auth/salt/', SaltView.as_view(), name='auth_salt'),
    path('auth/login/', LoginView.as_view(), name='auth_login'),
    path('auth/login/verify/', LoginVerifyView.as_view(), name='auth_login_verify'),
    path('auth/logout/', LogoutView.as_view(), name='auth_logout'),
    path('auth/refresh/', CustomTokenRefreshView.as_view(), name='auth_token_refresh'),
    path('auth/password-reset/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('auth/password-reset/verify/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('auth/email-change/', EmailChangeRequestView.as_view(), name='email_change_request'),
    path('auth/email-change/verify/', EmailChangeConfirmView.as_view(), name='email_change_confirm'),
    path('auth/tfa/toggle/', TfaToggleView.as_view(), name='tfa_toggle'),
    path('auth/reset-database/', DatabaseResetView.as_view(), name='reset_database'),

    # Audit Logs
    path('audit-logs/', ActivityLogListView.as_view(), name='audit_logs'),

    # Include viewsets
    path('', include(router.urls)),
]
