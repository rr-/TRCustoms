import contextlib
from typing import Any

from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from django.db import models
from rest_framework.request import Request

from trcustoms.audit_logs.consts import ChangeType
from trcustoms.audit_logs.models import AuditLog
from trcustoms.audit_logs.registry import get_registered_model_info
from trcustoms.common.utils.discord import send_discord_webhook
from trcustoms.users.models import User


def notify_discord(audit_log: AuditLog) -> None:
    """Send audit log notification to Discord if webhook is configured."""
    url: str | None = settings.DISCORD_WEBHOOK_MOD_URL
    if not url:
        return

    model_name = audit_log.object_type.model.title()
    title = f"{audit_log.object_type.model.title()}: {audit_log.object_name}"
    description = (
        f"**{audit_log.change_type.title()}** of **{model_name}**"
        f" #{audit_log.object_id}"
    )
    if audit_log.change_author:
        description += f"\n**Author:** {audit_log.change_author.username}"

    if audit_log.changes:
        changes = ", ".join(audit_log.changes)
        description += f"\n**Changes:** {changes}"
    else:
        changes = ""
    if "approv" in changes.lower():
        description += " 🟢"
    elif "reject" in changes.lower():
        description += " 🔴"
    elif audit_log.is_action_required:
        description += " 🟡"

    # Add link to frontend for supported entity types
    link_url: str | None
    match audit_log.object_type.model:
        case "level":
            link_url = f"{settings.HOST_SITE}/levels/{audit_log.object_id}"
        case "walkthrough":
            link_url = (
                f"{settings.HOST_SITE}/walkthroughs/{audit_log.object_id}"
            )
        case "user":
            link_url = f"{settings.HOST_SITE}/users/{audit_log.object_id}"
        case "review":
            link_url = f"{settings.HOST_SITE}/reviews/{audit_log.object_id}"
        case _:
            link_url = None

    embed = {"title": title, "description": description}
    if link_url:
        embed["url"] = link_url

    send_discord_webhook(
        {"embeds": [embed]},
        webhook_url=url,
    )


def make_audit_log(
    obj: models.Model,
    request: Request | None,
    change_type: ChangeType,
    changes: list[str],
    change_author: User | None = None,
    is_action_required: bool = False,
    notify: bool = False,
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

    log = AuditLog.objects.create(
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
    if log.is_action_required or notify:
        notify_discord(log)


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
