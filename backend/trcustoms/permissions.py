from rest_framework.permissions import BasePermission, IsAuthenticated

from trcustoms.levels.models import Level
from trcustoms.reviews.models import LevelReview
from trcustoms.users.models import User, UserPermission
from trcustoms.walkthroughs.models import Walkthrough


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
            return permission in get_permissions(request.user)

        def has_object_permission(self, request, view, obj) -> bool:
            return self.has_permission(request, view)

    return HasPermissionImpl


class IsAccessingOwnResource(IsAuthenticated):
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
            case LevelReview():
                result = obj.author == request.user
            case Walkthrough():
                result = obj.author == request.user
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
            UserPermission.EDIT_NEWS,
        }

    if not user.is_anonymous:
        perms |= {
            UserPermission.REVIEW_LEVELS,
            UserPermission.UPLOAD_LEVELS,
            UserPermission.POST_WALKTHROUGHS,
        }

    perms |= {
        UserPermission.LIST_USERS,
        UserPermission.VIEW_USERS,
    }

    return perms
