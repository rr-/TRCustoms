from rest_framework.request import Request

from trcustoms.audit_logs.utils import (
    clear_audit_log_action_flags,
    track_model_update,
)
from trcustoms.levels.models import Level
from trcustoms.mails import send_level_approved_mail


def approve_level(level: Level, request: Request | None) -> None:
    with track_model_update(obj=level, request=request, changes=["Approved"]):
        if not level.is_approved:
            send_level_approved_mail(level)
        level.is_approved = True
        level.rejection_reason = None
        level.save()
    clear_audit_log_action_flags(obj=level)


def reject_level(level: Level, request: Request | None, reason: str) -> None:
    with track_model_update(
        obj=level,
        request=request,
        changes=[f"Rejected (reason: {reason})"],
    ):
        level.is_approved = False
        level.rejection_reason = reason
        level.save()
    clear_audit_log_action_flags(obj=level)
