from rest_framework.request import Request

from trcustoms.audit_logs.utils import (
    clear_audit_log_action_flags,
    track_model_creation,
    track_model_deletion,
    track_model_update,
)
from trcustoms.mails import (
    send_ban_mail,
    send_registration_rejection_mail,
    send_welcome_mail,
)
from trcustoms.users.models import User


def activate_user(user: User, request: Request | None) -> None:
    with track_model_update(obj=user, request=request, changes=["Activated"]):
        if not user.is_active:
            send_welcome_mail(user)
        user.is_active = True
        user.is_pending_activation = False
        user.ban_reason = None
        user.save()
    clear_audit_log_action_flags(obj=user)


def wipe_user(user: User) -> None:
    user.is_pending_activation = False
    user.email = ""
    user.first_name = ""
    user.last_name = ""
    user.is_staff = False
    user.is_superuser = False
    user.bio = ""
    user.picture = None
    user.country = None
    user.set_unusable_password()
    user.save()


def reject_user(user: User, request: Request | None, reason: str) -> None:
    if user.is_email_confirmed:
        send_registration_rejection_mail(user, reason)

    track_model_deletion(
        obj=user,
        request=request,
        changes=[f"Rejected (reason: {reason})"],
    )
    clear_audit_log_action_flags(obj=user)
    if (
        user.authored_levels.exists()
        or user.authored_news.exists()
        or user.reviewed_levels.exists()
        or user.uploaded_levels.exists()
    ):
        wipe_user(user)
    else:
        user.delete()


def deactivate_user(user: User, request: Request | None, reason: str) -> None:
    with track_model_update(
        obj=user,
        request=request,
        changes=[f"Deactivated (reason: {reason})"],
    ):
        user.is_active = False
        user.ban_reason = reason
        user.is_pending_activation = True
        user.save()
    clear_audit_log_action_flags(obj=user)


def unban_user(user: User, request: Request | None) -> None:
    with track_model_update(obj=user, request=request, changes=["Unbanned"]):
        user.is_banned = False
        user.ban_reason = None
        user.save()
    clear_audit_log_action_flags(obj=user)


def ban_user(user: User, request: Request | None, reason: str) -> None:
    with track_model_update(
        obj=user, request=request, changes=[f"Banned (reason: {reason})"]
    ):
        if not user.is_banned:
            send_ban_mail(user, reason)
        user.is_banned = True
        user.ban_reason = reason
        user.save()
    clear_audit_log_action_flags(obj=user)


def confirm_user_email(user: User, request: Request | None) -> None:
    if user.is_email_confirmed:
        return

    user.is_email_confirmed = True
    user.save()

    track_model_creation(
        user,
        request=request,
        change_author=user,
        is_action_required=True,
    )
