from rest_framework import exceptions
from rest_framework.request import Request

from trcustoms.audit_logs.utils import (
    clear_audit_log_action_flags,
    track_model_update,
)
from trcustoms.mails import (
    send_walkthrough_approved_mail,
    send_walkthrough_rejected_mail,
    send_walkthrough_submission_mail,
)
from trcustoms.tasks import update_awards
from trcustoms.walkthroughs.consts import WalkthroughStatus
from trcustoms.walkthroughs.models import Walkthrough


def publish_walkthrough(
    walkthrough: Walkthrough, request: Request | None
) -> None:
    if walkthrough.status != WalkthroughStatus.DRAFT:
        raise exceptions.ParseError(detail="Only drafts can be published.")
    with track_model_update(
        obj=walkthrough,
        request=request,
        changes=["Published"],
        is_action_required=True,
    ):
        walkthrough.status = WalkthroughStatus.PENDING_APPROVAL
        walkthrough.rejection_reason = None
        walkthrough.save()


def approve_walkthrough(
    walkthrough: Walkthrough, request: Request | None
) -> None:
    with track_model_update(
        obj=walkthrough, request=request, changes=["Approved"]
    ):
        if walkthrough.status != WalkthroughStatus.APPROVED:
            send_walkthrough_submission_mail(walkthrough)
            send_walkthrough_approved_mail(walkthrough)
        walkthrough.status = WalkthroughStatus.APPROVED
        walkthrough.rejection_reason = None
        walkthrough.save()
        update_awards.delay(walkthrough.author.pk)
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
        if (
            walkthrough.status != WalkthroughStatus.REJECTED
            or reason != walkthrough.rejection_reason
        ):
            send_walkthrough_rejected_mail(walkthrough, reason)
        walkthrough.status = WalkthroughStatus.REJECTED
        walkthrough.rejection_reason = reason
        walkthrough.save()
