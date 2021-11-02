from typing import TYPE_CHECKING, Protocol

from rest_framework.permissions import BasePermission


class PermissionsMixinProtocol(Protocol):
    """Interface for the classes using the PermissionMixin."""

    @property
    def permission_classes_by_action(self) -> dict[str, list[BasePermission]]:
        """A map of action to list of permissions."""
        ...

    @property
    def permission_classes(self) -> list[BasePermission]:
        """Fallback default list of permissions."""
        ...

    @property
    def action(self) -> str:
        """Current request action."""
        ...


if not TYPE_CHECKING:
    # protocols cause problems with Django
    PermissionsMixinProtocol = object


class PermissionsMixin(PermissionsMixinProtocol):
    """A mixin for permission management."""

    def get_permissions(self) -> list[BasePermission]:
        """Return permission depending on `action` by looking at a
        `permission_classes_by_action` map.

        If the action is not mapped, falls back to `permission_classes`.
        """
        if self.action in self.permission_classes_by_action:
            return [
                permission()
                for permission in self.permission_classes_by_action[
                    self.action
                ]
            ]
        return [permission() for permission in self.permission_classes]
