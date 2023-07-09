import contextlib
from typing import Any

from django.contrib.contenttypes.models import ContentType
from django.db import models
from rest_framework.request import Request

from trcustoms.audit_logs.consts import ChangeType
from trcustoms.audit_logs.models import AuditLog
from trcustoms.audit_logs.registry import get_registered_model_info
from trcustoms.users.models import User


def make_audit_log(
    obj: models.Model,
    request: Request | None,
    change_type: ChangeType,
    changes: list[str],
    change_author: User | None = None,
    is_action_required: bool = False,
    meta: Any = None,
) -> None:
    info = get_registered_model_info(obj)
    object_id = obj.pk
    object_name = info.name_getter(obj)
    object_type = ContentType.objects.get_for_model(obj)
    if meta is None:
        meta = info.meta_factory(obj)
    if meta is None:
        meta = {}

    if not changes:
        return

    AuditLog.objects.create(
        object_id=object_id,
        object_name=object_name,
        object_type=object_type,
        change_type=change_type,
        change_author=(
            change_author
            or (
                request.user
                if request and not request.user.is_anonymous
                else None
            )
        ),
        is_action_required=is_action_required,
        changes=changes,
        meta=meta,
    )


def track_model_creation(
    obj: models.Model, request: Request | None, **kwargs
) -> None:
    kwargs = dict(changes=["Created"]) | kwargs
    make_audit_log(
        obj=obj,
        request=request,
        change_type=ChangeType.CREATE,
        **kwargs,
    )


@contextlib.contextmanager
def track_model_update(obj: models.Model, request: Request | None, **kwargs):
    kwargs = dict(changes=["Updated"]) | kwargs
    # TODO: track more detailed changes
    yield
    make_audit_log(
        obj=obj,
        request=request,
        change_type=ChangeType.UPDATE,
        **kwargs,
    )


def track_model_deletion(
    obj: models.Model, request: Request | None, **kwargs
) -> None:
    kwargs = dict(changes=["Deleted"]) | kwargs
    make_audit_log(
        obj=obj,
        request=request,
        change_type=ChangeType.DELETE,
        **kwargs,
    )


def clear_audit_log_action_flags(obj: models.Model) -> None:
    object_id = obj.pk
    object_type = ContentType.objects.get_for_model(obj)

    AuditLog.objects.filter(
        object_id=object_id, object_type=object_type, is_action_required=True
    ).update(is_action_required=False)
