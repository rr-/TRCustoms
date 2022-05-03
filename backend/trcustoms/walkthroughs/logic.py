from rest_framework.request import Request

from trcustoms.audit_logs.utils import (
    clear_audit_log_action_flags,
    track_model_update,
)
from trcustoms.mails import (
    send_walkthrough_approved_mail,
    send_walkthrough_rejected_mail,
)
from trcustoms.walkthroughs.models import Walkthrough


def approve_walkthrough(
    walkthrough: Walkthrough, request: Request | None
) -> None:
    with track_model_update(
        obj=walkthrough, request=request, changes=["Approved"]
    ):
        send_mail = not walkthrough.is_approved
        walkthrough.is_pending_approval = False
        walkthrough.is_approved = True
        if send_mail:
            send_walkthrough_approved_mail(walkthrough)
        walkthrough.rejection_reason = None
        walkthrough.save()
    clear_audit_log_action_flags(obj=walkthrough)


def reject_walkthrough(
    walkthrough: Walkthrough, request: Request | None, reason: str
) -> None:
    clear_audit_log_action_flags(obj=walkthrough)
    with track_model_update(
        obj=walkthrough,
        request=request,
        changes=[f"Rejected (reason: {reason})"],
        is_action_required=True,
    ):
        if walkthrough.is_approved or reason != walkthrough.rejection_reason:
            send_walkthrough_rejected_mail(walkthrough, reason)
        walkthrough.is_pending_approval = False
        walkthrough.is_approved = False
        walkthrough.rejection_reason = reason
        walkthrough.save()
