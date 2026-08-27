import secrets
from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.utils import timezone
from rest_framework import permissions, viewsets, generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

from .models import Admin, EncryptedBank, ActivityLog
from .serializers import (
    AdminSerializer, AdminCreateSerializer,
    EncryptedBankSerializer, ActivityLogSerializer
)


class IsSuperAdmin(permissions.BasePermission):
    """
    Grants access only to Level 3 (Super Admin) accounts.
    Also checks is_active -- a deactivated super admin is rejected immediately.
    Applied to: POST /vault/, DELETE /vault/<id>/, POST /entities/
    """
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated  # Check 1: Is there a valid JWT token?
            and request.user.is_active      # Check 2: Is the account not deactivated?
            and request.user.level == 3     # Check 3: Is the clearance level exactly 3?
        )


class IsLimitedAccessOrAbove(permissions.BasePermission):
    """
    Grants access to Level 2 and Level 3 accounts.
    Applied to: PUT/PATCH /vault/<id>/, GET /audit-logs/
    """
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.is_active
            and request.user.level >= 2  # >= 2 means Level 2 OR Level 3
        )


class IsReadOnlyOrAbove(permissions.BasePermission):
    """
    Grants access to all authenticated, active admins (Level 1, 2, and 3).
    Applied to: GET /vault/, GET /entities/
    """
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.is_active
            and request.user.level >= 1  # Any valid level passes
        )


# Helper function to extract client IP address accurately (handling reverse proxy setup)
def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0].strip()
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


class LoginView(APIView):
    """
    Secure Login Initialization (Phase 1).
    1. Verifies credentials (email + client-side login hash).
    2. Generates a cryptographically secure 6-digit OTP.
    3. Saves the OTP and expiration (5 minutes) on the Admin model.
    4. Sends the OTP to the admin's email using django.core.mail.send_mail.
    5. Throttled via the 'login' configuration (max 5 attempts/minute).
    """
    permission_classes = (AllowAny,)
    throttle_scope = 'login'  # Activates the login rate-limiting of 5/minute

    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        password = request.data.get('password')  # This is the derived login hash from client
        ip = get_client_ip(request)

        # Authenticate using custom user model backing
        user = authenticate(email=email, password=password)

        if user is None:
            # Audit failed login attempt for security tracking
            ActivityLog.objects.create(
                action="Login Failed",
                details=f"Failed login attempt for email {email}",
                user_snapshot=email or "Unknown",
                log_type="warning",
                ip_address=ip
            )
            return Response(
                {"detail": "Invalid credentials or deactivated account."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.is_active:
            return Response(
                {"detail": "This account has been deactivated."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Generate a secure 6-digit OTP code
        otp_code = f"{secrets.randbelow(900000) + 100000}"
        user.otp_code = otp_code
        user.otp_expires_at = timezone.now() + timezone.timedelta(minutes=5)
        user.save()

        # Send OTP via email
        try:
            send_mail(
                subject="Your Secure Vault OTP Verification Code",
                message=f"Hello {user.name},\n\nYour OTP code is: {otp_code}\n\nIt is valid for 5 minutes. If you did not initiate this login, please secure your account immediately.\n\nSecure Vault Admin",
                from_email=None,
                recipient_list=[user.email],
                fail_silently=False,
            )
        except Exception as e:
            # Fallback for development/testing: log to console if mail server isn't set up
            print(f"SMTP Error: {str(e)}. Simulated OTP Sent to {user.email}: {otp_code}")

        return Response({
            "detail": "OTP code has been sent to your registered email address.",
            "otp_required": True
        }, status=status.HTTP_200_OK)


class LoginVerifyView(APIView):
    """
    Secure Login Verification (Phase 2).
    1. Re-verifies credentials (email + password).
    2. Validates the submitted OTP code against database record.
    3. Confirms OTP code is not expired.
    4. Issues short-lived access JWT and HttpOnly refresh token cookie.
    """
    permission_classes = (AllowAny,)
    throttle_scope = 'login'

    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        password = request.data.get('password')
        otp_submitted = request.data.get('otp')
        ip = get_client_ip(request)

        user = authenticate(email=email, password=password)

        if user is None or not user.is_active:
            return Response(
                {"detail": "Authentication failed or account deactivated."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Verify OTP code and expiration
        if not user.otp_code or user.otp_code != otp_submitted:
            ActivityLog.objects.create(
                action="OTP Verification Failed",
                details=f"Invalid OTP code submitted for {email}",
                user_snapshot=email,
                log_type="warning",
                ip_address=ip
            )
            return Response(
                {"detail": "Invalid OTP code."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if timezone.now() > user.otp_expires_at:
            return Response(
                {"detail": "OTP code has expired. Please request a new one."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # OTP is valid, clear it from database
        user.otp_code = None
        user.otp_expires_at = None
        user.save()

        # Issue tokens
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        # Audit successful login
        ActivityLog.objects.create(
            action="Login Success",
            details=f"Admin {user.name} completed 2FA login successfully",
            user=user,
            user_snapshot=user.name,
            log_type="success",
            ip_address=ip
        )

        response = Response({
            "access": access_token,
            "user": AdminSerializer(user).context({'request': request}).data if hasattr(AdminSerializer(user), 'context') else AdminSerializer(user).data
        }, status=status.HTTP_200_OK)

        response.set_cookie(
            key='refresh_token',
            value=str(refresh),
            httponly=True,
            secure=True,
            samesite='Strict',
            path='/api/v1/auth/refresh/'
        )
        return response


class LogoutView(APIView):
    """
    Secure Logout Endpoint.
    1. Blacklists the current refresh token to prevent reuse.
    2. Clears the HttpOnly cookie.
    """
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        ip = get_client_ip(request)
        refresh_token = request.COOKIES.get('refresh_token')

        if refresh_token:
            try:
                # Blacklist the token in DB
                token = RefreshToken(refresh_token)
                token.blacklist()
            except (TokenError, InvalidToken):
                pass

        # Audit logout action
        ActivityLog.objects.create(
            action="Logout",
            details=f"Admin {request.user.name} logged out",
            user=request.user,
            user_snapshot=request.user.name,
            log_type="info",
            ip_address=ip
        )

        response = Response({"detail": "Logged out successfully."}, status=status.HTTP_200_OK)
        # Clear the cookie
        response.delete_cookie('refresh_token', path='/api/v1/auth/refresh/')
        return response


class CustomTokenRefreshView(TokenRefreshView):
    """
    Enhanced Token Refresh Endpoint.
    Reads the refresh token from the secure HttpOnly cookie rather than the JSON body,
    rotates the refresh token (saving the new one back to the cookie), and returns the new access token.
    """
    def post(self, request, *args, **kwargs):
        # Extract refresh token from cookie instead of body
        refresh_token = request.COOKIES.get('refresh_token')
        if not refresh_token:
            return Response({"detail": "Refresh token cookie missing."}, status=status.HTTP_400_BAD_REQUEST)

        # Override request data with token from cookie to satisfy DRF SimpleJWT's base view
        serializer = self.get_serializer(data={"refresh": refresh_token})

        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])

        new_access_token = serializer.validated_data.get('access')
        new_refresh_token = serializer.validated_data.get('refresh')

        response = Response({
            "access": new_access_token
        }, status=status.HTTP_200_OK)

        # If token rotation is active, update the cookie with the newly rotated refresh token
        if new_refresh_token:
            response.set_cookie(
                key='refresh_token',
                value=str(new_refresh_token),
                httponly=True,
                secure=True,
                samesite='Strict',
                path='/api/v1/auth/refresh/'
            )
        return response


class EncryptedBankViewSet(viewsets.ModelViewSet):
    """
    CRUD Viewset for EncryptedBank.
    Enforces granular RBAC permissions per action and logs all access.
    """
    queryset = EncryptedBank.objects.all().order_by('-created_at')
    serializer_class = EncryptedBankSerializer

    def get_permissions(self):
        # Granular mapping of API actions to custom clearance permissions
        if self.action in ['list', 'retrieve']:
            permission_classes = [IsReadOnlyOrAbove]
        elif self.action in ['create', 'destroy']:
            permission_classes = [IsSuperAdmin]
        else:  # update, partial_update
            permission_classes = [IsLimitedAccessOrAbove]
        return [permission() for permission in permission_classes]

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Audit every single access to specific credentials
        ActivityLog.objects.create(
            action="Credential Accessed",
            details=f"Viewed details for credential card: {instance.name}",
            user=request.user,
            user_snapshot=request.user.name,
            log_type="success",
            ip_address=get_client_ip(request)
        )
        return super().retrieve(request, *args, **kwargs)

    def perform_create(self, serializer):
        instance = serializer.save()
        ActivityLog.objects.create(
            action="Credential Created",
            details=f"Created new credential card: {instance.name}",
            user=self.request.user,
            user_snapshot=self.request.user.name,
            log_type="success",
            ip_address=get_client_ip(self.request)
        )

    def perform_update(self, serializer):
        instance = serializer.save()
        ActivityLog.objects.create(
            action="Credential Updated",
            details=f"Updated credential card: {instance.name}",
            user=self.request.user,
            user_snapshot=self.request.user.name,
            log_type="info",
            ip_address=get_client_ip(self.request)
        )

    def perform_destroy(self, instance):
        card_name = instance.name
        instance.delete()
        ActivityLog.objects.create(
            action="Credential Deleted",
            details=f"Permanently deleted credential card: {card_name}",
            user=self.request.user,
            user_snapshot=self.request.user.name,
            log_type="warning",
            ip_address=get_client_ip(self.request)
        )


class ActivityLogListView(generics.ListAPIView):
    """
    Audit Trail Viewer Endpoint.
    Restricted to Level 2 (Limited Access) and Level 3 (Super Admin).
    """
    queryset = ActivityLog.objects.all().order_by('-timestamp')
    serializer_class = ActivityLogSerializer
    permission_classes = (IsLimitedAccessOrAbove,)
