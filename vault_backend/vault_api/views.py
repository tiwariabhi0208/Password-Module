import hashlib
import hmac
import secrets
from django.conf import settings
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

        # Check if 2FA/OTP is enabled
        otp_enabled = getattr(settings, 'OTP_ENABLED', False)

        if otp_enabled:
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
        else:
            # OTP is disabled, issue access and refresh tokens directly
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)

            # Audit successful login
            ActivityLog.objects.create(
                action="Login Success",
                details=f"Admin {user.name} completed login successfully (2FA bypassed)",
                user=user,
                user_snapshot=user.name,
                log_type="success",
                ip_address=ip
            )

            # Generate a unique cryptographic signature token for this user
            user_signature = hmac.new(
                settings.SECRET_KEY.encode('utf-8'),
                user.email.encode('utf-8'),
                hashlib.sha256
            ).hexdigest()

            response = Response({
                "access": access_token,
                "user": {
                    **AdminSerializer(user, context={'request': request}).data,
                    "public_signature": user_signature,
                    "ip": ip
                },
                "otp_required": False
            }, status=status.HTTP_200_OK)

            response.set_cookie(
                key='refresh_token',
                value=str(refresh),
                httponly=True,
                secure=settings.REFRESH_COOKIE_SECURE,
                samesite='Strict',
                path='/api/v1/auth/refresh/'
            )
            return response


class LoginVerifyView(APIView):
    """
    Secure Login Verification (Phase 2).
    1. Re-verifies credentials (email + password).
    2. Validates the submitted OTP code against database record.
    3. Confirms OTP code is not expired.
    4. Issues short-lived access JWT and HttpOnly refresh token cookie.

    Brute-force protection:
    - Protected by DRF rate limiting via 'login' throttle scope.
    - Combined with a short 5-minute OTP expiry window, this prevents brute-force 
      enumeration attacks on the 6-digit code space.
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

        # Generate a unique cryptographic signature token for this user
        user_signature = hmac.new(
            settings.SECRET_KEY.encode('utf-8'),
            user.email.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()

        response = Response({
            "access": access_token,
            "user": {
                **AdminSerializer(user, context={'request': request}).data,
                "public_signature": user_signature,
                "ip": ip
            }
        }, status=status.HTTP_200_OK)

        response.set_cookie(
            key='refresh_token',
            value=str(refresh),
            httponly=True,
            secure=settings.REFRESH_COOKIE_SECURE,
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


class PasswordResetRequestView(APIView):
    """
    Sends an OTP code for password reset.
    Validation: Checks if email is registered. If not, returns 404.
    """
    permission_classes = (AllowAny,)

    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        if not email:
            return Response({"detail": "Email address is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = Admin.objects.get(email=email.strip().lower())
        except Admin.DoesNotExist:
            # Audit unauthorized password reset attempt for tracking
            ActivityLog.objects.create(
                action="Password Reset Rejected",
                details=f"Password reset requested for unregistered email: {email}",
                user_snapshot=email,
                log_type="warning",
                ip_address=get_client_ip(request)
            )
            return Response({"detail": "This email address is not registered in our system."}, status=status.HTTP_404_NOT_FOUND)

        if not user.is_active:
            return Response({"detail": "This account is deactivated."}, status=status.HTTP_403_FORBIDDEN)

        # Generate a secure 6-digit OTP code
        otp_code = f"{secrets.randbelow(900000) + 100000}"
        user.otp_code = otp_code
        user.otp_expires_at = timezone.now() + timezone.timedelta(minutes=5)
        user.save()

        # Send OTP via email
        try:
            send_mail(
                subject="Your Secure Vault Password Reset Code",
                message=f"Hello {user.name},\n\nYour password reset verification code is: {otp_code}\n\nIt is valid for 5 minutes. If you did not request this, please contact IT immediately.\n\nSecure Vault Admin",
                from_email=None,
                recipient_list=[user.email],
                fail_silently=False,
            )
        except Exception as e:
            # Fallback for development/testing: log to console if mail server isn't set up
            print(f"SMTP Error: {str(e)}. Simulated Password Reset OTP Sent to {user.email}: {otp_code}")

        return Response({
            "detail": "Password reset OTP sent successfully.",
            "otp_sent": True
        }, status=status.HTTP_200_OK)


class PasswordResetConfirmView(APIView):
    """
    Verifies the OTP and resets the password.
    """
    permission_classes = (AllowAny,)

    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        otp_submitted = request.data.get('otp')
        new_password = request.data.get('new_password')
        ip = get_client_ip(request)

        if not email or not otp_submitted or not new_password:
            return Response({"detail": "Email, OTP, and new password are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = Admin.objects.get(email=email.strip().lower())
        except Admin.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        if not user.is_active:
            return Response({"detail": "This account is deactivated."}, status=status.HTTP_403_FORBIDDEN)

        # Verify OTP code and expiration
        if not user.otp_code or user.otp_code != otp_submitted.strip():
            ActivityLog.objects.create(
                action="Password Reset Failed",
                details=f"Invalid password reset OTP code submitted for {email}",
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

        # OTP is valid, update password and clear OTP fields
        user.set_password(new_password)
        user.otp_code = None
        user.otp_expires_at = None
        user.save()

        # Audit successful password reset
        ActivityLog.objects.create(
            action="Password Reset Success",
            details=f"Admin {user.name} successfully reset their master password via OTP validation",
            user=user,
            user_snapshot=user.name,
            log_type="warning",
            ip_address=ip
        )

        return Response({"detail": "Password has been reset successfully. Please log in with your new password."}, status=status.HTTP_200_OK)


class EmailChangeRequestView(APIView):
    """
    Sends an OTP code to verify a new email address.
    Protected: Only authenticated admins can change their email.
    """
    permission_classes = (IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        new_email = request.data.get('new_email')
        if not new_email:
            return Response({"detail": "New email address is required."}, status=status.HTTP_400_BAD_REQUEST)

        new_email_clean = new_email.strip().lower()

        # Check if the new email is already taken by another admin
        if Admin.objects.filter(email=new_email_clean).exclude(id=request.user.id).exists():
            return Response({"detail": f"The email address '{new_email_clean}' is already registered to another account."}, status=status.HTTP_400_BAD_REQUEST)

        # Generate a secure 6-digit OTP code
        otp_code = f"{secrets.randbelow(900000) + 100000}"
        request.user.otp_code = otp_code
        request.user.otp_expires_at = timezone.now() + timezone.timedelta(minutes=5)
        request.user.save()

        # Send OTP to the new email address
        try:
            send_mail(
                subject="Verify Your New Vault Email Address",
                message=f"Hello {request.user.name},\n\nYou requested to change your email address. Please use this verification code to confirm: {otp_code}\n\nIt is valid for 5 minutes.\n\nSecure Vault Admin",
                from_email=None,
                recipient_list=[new_email_clean],
                fail_silently=False,
            )
        except Exception as e:
            # Fallback for development/testing
            print(f"SMTP Error: {str(e)}. Simulated Email Change OTP Sent to {new_email_clean}: {otp_code}")

        return Response({
            "detail": "Verification OTP sent successfully to the new email address.",
            "otp_sent": True
        }, status=status.HTTP_200_OK)


class EmailChangeConfirmView(APIView):
    """
    Verifies the OTP and updates the email address of the authenticated admin.
    """
    permission_classes = (IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        new_email = request.data.get('new_email')
        otp_submitted = request.data.get('otp')
        ip = get_client_ip(request)

        if not new_email or not otp_submitted:
            return Response({"detail": "New email and OTP are required."}, status=status.HTTP_400_BAD_REQUEST)

        new_email_clean = new_email.strip().lower()
        user = request.user

        # Verify OTP code and expiration
        if not user.otp_code or user.otp_code != otp_submitted.strip():
            return Response(
                {"detail": "Invalid OTP code."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if timezone.now() > user.otp_expires_at:
            return Response(
                {"detail": "OTP code has expired. Please request a new one."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check again if email is taken (to prevent race conditions)
        if Admin.objects.filter(email=new_email_clean).exclude(id=user.id).exists():
            return Response({"detail": "This email address is already taken."}, status=status.HTTP_400_BAD_REQUEST)

        old_email = user.email
        user.email = new_email_clean
        user.otp_code = None
        user.otp_expires_at = None
        user.save()

        # Audit successful email change
        ActivityLog.objects.create(
            action="Email Updated",
            details=f"Admin {user.name} changed email from {old_email} to {new_email_clean}",
            user=user,
            user_snapshot=user.name,
            log_type="warning",
            ip_address=ip
        )

        return Response({"detail": "Email address updated successfully.", "email": new_email_clean}, status=status.HTTP_200_OK)


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
                secure=settings.REFRESH_COOKIE_SECURE,
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


class SaltView(APIView):
    """
    Returns a secure, deterministic salt for a given email.
    Uses HMAC-SHA256 with the server's SECRET_KEY to produce the salt.
    This ensures the salt is unique and unpredictable, without requiring database storage.
    """
    permission_classes = (AllowAny,)

    def get(self, request, *args, **kwargs):
        email = request.query_params.get('email')
        if not email:
            return Response({"detail": "Email parameter is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Derive a 16-byte salt using HMAC
        key = settings.SECRET_KEY.encode('utf-8')
        msg = email.strip().lower().encode('utf-8')
        salt_hex = hmac.new(key, msg, hashlib.sha256).hexdigest()[:32] # 32 hex chars = 16 bytes

        return Response({"salt": salt_hex}, status=status.HTTP_200_OK)
