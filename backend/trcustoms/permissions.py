from rest_framework.permissions import BasePermission

from trcustoms.models import Level, LevelReview, User, UserPermission


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
            return permission in getattr(request.user, "permissions", [])

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
