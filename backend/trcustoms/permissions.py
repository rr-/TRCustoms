from rest_framework.permissions import (
    SAFE_METHODS,
    BasePermission,
    IsAuthenticated,
)

from trcustoms.ownership import is_owner
from trcustoms.users.models import User, UserPermission


class AllowNone(BasePermission):
    def has_permission(self, request, view) -> bool:
        return False

    def has_object_permission(self, request, view, obj) -> bool:
        return False


class AllowReadOnly(BasePermission):
    def has_permission(self, request, view):
        return request.method in SAFE_METHODS


def HasPermission(permission: UserPermission) -> BasePermission:
    class HasPermissionImpl(BasePermission):
        def has_permission(self, request, view) -> bool:
            if not request.user:
                return False
            return permission in get_permissions(request.user)

        def has_object_permission(self, request, view, obj) -> bool:
            return self.has_permission(request, view)

    return HasPermissionImpl


class IsAccessingOwnResource(IsAuthenticated):
    def has_permission(self, request, view):
        user_id = view.kwargs.get("user_id")
        if user_id:
            return user_id == request.user.pk
        return super().has_permission(request, view)

    def has_object_permission(self, request, view, obj) -> bool:
        if not request.user:
            return False
        return is_owner(obj, request.user)


def get_permissions(user: User) -> set[UserPermission]:
    perms = {
        perm
        for perm in UserPermission
        if f"trcustoms.{perm.value}" in user.get_user_permissions()
    }

    if user.is_superuser:
        perms |= set(UserPermission)

    if user.is_staff:
        perms |= set(UserPermission) - {
            UserPermission.DELETE_LEVELS,
            UserPermission.DELETE_WALKTHROUGHS,
            UserPermission.EDIT_USERS,
            UserPermission.EDIT_RATINGS,
            UserPermission.DELETE_RATINGS,
            UserPermission.EDIT_NEWS,
            UserPermission.EDIT_TAGS,
        }

    if not user.is_anonymous:
        perms |= {
            UserPermission.RATE_LEVELS,
            UserPermission.REVIEW_LEVELS,
            UserPermission.UPLOAD_LEVELS,
            UserPermission.POST_WALKTHROUGHS,
        }

    perms |= {
        UserPermission.LIST_USERS,
        UserPermission.VIEW_USERS,
    }

    return perms


def has_permission(user: User, permission: UserPermission) -> bool:
    return permission in get_permissions(user)
