from rest_framework.request import Request

from trcustoms.audit_logs.utils import (
    clear_audit_log_action_flags,
    track_model_update,
)
from trcustoms.levels.models import Level
from trcustoms.mails import send_level_approved_mail, send_level_rejected_mail


def approve_level(level: Level, request: Request | None) -> None:
    with track_model_update(obj=level, request=request, changes=["Approved"]):
        send_mail = not level.is_approved
        level.is_pending_approval = False
        level.is_approved = True
        if send_mail:
            send_level_approved_mail(level)
        level.rejection_reason = None
        level.save()
    clear_audit_log_action_flags(obj=level)


def reject_level(level: Level, request: Request | None, reason: str) -> None:
    clear_audit_log_action_flags(obj=level)
    with track_model_update(
        obj=level,
        request=request,
        changes=[f"Rejected (reason: {reason})"],
        is_action_required=True,
    ):
        if level.is_approved or reason != level.rejection_reason:
            send_level_rejected_mail(level, reason)
        level.is_pending_approval = False
        level.is_approved = False
        level.rejection_reason = reason
        level.save()
