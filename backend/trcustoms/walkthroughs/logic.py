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
from trcustoms.users.models import User
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
        notify=True,
    ):
        walkthrough.status = WalkthroughStatus.PENDING_APPROVAL
        walkthrough.rejection_reason = None
        walkthrough.save()


def approve_walkthrough(
    walkthrough: Walkthrough, request: Request | None
) -> None:
    with track_model_update(
        obj=walkthrough, request=request, changes=["Approved"], notify=True
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
        notify=True,
    ):
        if (
            walkthrough.status != WalkthroughStatus.REJECTED
            or reason != walkthrough.rejection_reason
        ):
            send_walkthrough_rejected_mail(walkthrough, reason)
        walkthrough.status = WalkthroughStatus.REJECTED
        walkthrough.rejection_reason = reason
        walkthrough.save()


def reassign_walkthrough(
    walkthrough: Walkthrough, request: Request | None, new_author: User
) -> None:
    old_author = walkthrough.author
    old_author_name = (
        old_author.username
        if old_author
        else walkthrough.legacy_author_name or "unknown"
    )
    with track_model_update(
        obj=walkthrough,
        request=request,
        changes=[
            f"Reassigned from {old_author_name} to {new_author.username}"
        ],
    ):
        walkthrough.author = new_author
        walkthrough.save()
    if old_author:
        old_author.update_authored_walkthrough_count()
        update_awards.delay(old_author.pk)
    update_awards.delay(new_author.pk)
