from typing import TYPE_CHECKING, Protocol

from rest_framework import serializers
from rest_framework.permissions import BasePermission

from trcustoms.audit_logs.utils import (
    clear_audit_log_action_flags,
    track_model_creation,
    track_model_deletion,
    track_model_update,
)


class PermissionsMixinProtocol(Protocol):
    """Interface for the classes using the PermissionMixin."""

    @property
    def permission_classes_by_action(self) -> dict[str, list[BasePermission]]:
        """A map of action to list of permissions."""

    @property
    def permission_classes(self) -> list[BasePermission]:
        """Fallback default list of permissions."""

    @property
    def action(self) -> str:
        """Current request action."""


if not TYPE_CHECKING:
    # protocols cause problems with Django
    PermissionsMixinProtocol = object  # noqa: F811


class PermissionsMixin(PermissionsMixinProtocol):
    def get_permissions(self) -> list[BasePermission]:
        """Return permission depending on `action` by looking at a
        `permission_classes_by_action` map.

        If the action is not mapped, falls back to `permission_classes`.
        """
        if self.action in self.permission_classes_by_action:
            ret = [
                permission()
                for permission in self.permission_classes_by_action[
                    self.action
                ]
            ]
        else:
            ret = [permission() for permission in self.permission_classes]
        return ret


class MultiSerializerMixin:
    def get_serializer_class(self):
        """Return serializer class depending on `action` by looking at a
        `serializer_class_by_action` map.

        If the action is not mapped, falls back to `serializer_class`.
        """
        if self.action in self.serializer_class_by_action:
            return self.serializer_class_by_action[self.action]
        return super().get_serializer_class()


class AuditLogModelWatcherCreateMixin:
    audit_log_review_create = False

    def perform_create(self, serializer: serializers.Serializer) -> None:
        super().perform_create(serializer)
        track_model_creation(
            serializer.instance,
            request=self.request,
            is_action_required=self.audit_log_review_create,
            notify=self.audit_log_review_create,
        )


class AuditLogModelWatcherUpdateMixin:
    audit_log_review_update = False

    def perform_update(self, serializer: serializers.Serializer) -> None:
        instance = self.get_object()
        with track_model_update(
            instance,
            request=self.request,
            is_action_required=self.audit_log_review_update,
            notify=False,
        ):
            super().perform_update(serializer)


class AuditLogModelWatcherDestroyMixin:
    def perform_destroy(self, instance) -> None:
        clear_audit_log_action_flags(obj=instance)
        track_model_deletion(instance, request=self.request, notify=True)
        super().perform_destroy(instance)


class AuditLogModelWatcherMixin(
    AuditLogModelWatcherCreateMixin,
    AuditLogModelWatcherUpdateMixin,
    AuditLogModelWatcherDestroyMixin,
):
    pass
