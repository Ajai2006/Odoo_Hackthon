"""
accounts/permissions.py — IsAdmin and IsEmployee permission classes.
Member 1 owns this; stub provided for payroll to import.
"""
from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """Allow access only to users with role='admin'."""
    message = 'Admin privileges required.'

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            getattr(request.user, 'role', None) == 'admin'
        )


class IsEmployee(BasePermission):
    """Allow access to any authenticated employee (admin OR employee role)."""
    message = 'Authentication required.'

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)


class IsOwnerOrAdmin(BasePermission):
    """Object-level: owner or admin."""
    def has_object_permission(self, request, view, obj):
        if getattr(request.user, 'role', None) == 'admin':
            return True
        employee = getattr(request.user, 'employee_profile', None)
        return employee and obj.employee == employee
