from rest_framework import permissions

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
