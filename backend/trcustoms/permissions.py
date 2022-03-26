from rest_framework.permissions import BasePermission

from trcustoms.levels.models import Level
from trcustoms.reviews.models import LevelReview
from trcustoms.users.models import User, UserPermission


class AllowNone(BasePermission):
    def has_permission(self, request, view) -> bool:
        return False

    def has_object_permission(self, request, view, obj) -> bool:
        return False


def HasPermission(permission: UserPermission) -> BasePermission:
    class HasPermissionImpl(BasePermission):
        def has_permission(self, request, view) -> bool:
            if not request.user:
                return False
            if request.user.is_staff:
                return True
            return permission in get_permissions(request.user)

        def has_object_permission(self, request, view, obj) -> bool:
            return self.has_permission(request, view)

    return HasPermissionImpl


class IsAccessingOwnResource(BasePermission):
    def has_object_permission(self, request, view, obj) -> bool:
        if not request.user:
            return False
        if isinstance(obj, User):
            return obj == request.user
        if isinstance(obj, Level):
            return (
                obj.uploader == request.user
                or obj.authors.filter(id=request.user.id).exists()
            )
        if isinstance(obj, LevelReview):
            return obj.author == request.user
        return False


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
            UserPermission.DELETE_REVIEWS,
            UserPermission.EDIT_REVIEWS,
        }

    if not user.is_anonymous:
        perms |= {
            UserPermission.LIST_USERS,  # autocomplete
            UserPermission.REVIEW_LEVELS,
            UserPermission.UPLOAD_LEVELS,
        }

    perms |= {
        UserPermission.VIEW_USERS,
    }

    return perms
