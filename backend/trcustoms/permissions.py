from rest_framework.permissions import (
    SAFE_METHODS,
    BasePermission,
    IsAuthenticated,
)

from trcustoms.levels.models import Level
from trcustoms.playlists.models import PlaylistItem
from trcustoms.ratings.models import Rating
from trcustoms.reviews.models import Review
from trcustoms.users.models import User, UserPermission
from trcustoms.walkthroughs.models import Walkthrough


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
        result = False
        match obj:
            case User():
                result = obj == request.user
            case Level():
                result = (
                    obj.uploader == request.user
                    or obj.authors.filter(id=request.user.id).exists()
                )
            case Review():
                result = obj.author == request.user
            case Rating():
                result = obj.author == request.user
            case Walkthrough():
                result = obj.author == request.user
            case PlaylistItem():
                result = obj.user == request.user
        return result


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
            UserPermission.EDIT_REVIEWS,
            UserPermission.EDIT_RATINGS,
            UserPermission.DELETE_RATINGS,
            UserPermission.EDIT_NEWS,
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
