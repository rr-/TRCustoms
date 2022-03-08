from rest_framework.request import Request

from trcustoms.audit_logs.utils import (
    clear_audit_log_action_flags,
    track_model_creation,
    track_model_deletion,
    track_model_update,
)
from trcustoms.users.models import User


def activate_user(user: User, request: Request | None) -> None:
    with track_model_update(obj=user, request=request, changes=["Activated"]):
        user.is_active = True
        user.is_pending_activation = False
        user.ban_reason = None
        user.save()
    clear_audit_log_action_flags(obj=user)


def reject_user(user: User, request: Request | None, reason: str) -> None:
    track_model_deletion(
        obj=user,
        request=request,
        changes=[f"Rejected (reason: {reason})"],
    )
    clear_audit_log_action_flags(obj=user)
    user.delete()


def deactivate_user(user: User, request: Request | None, reason: str) -> None:
    with track_model_update(
        obj=user,
        request=request,
        changes=[f"Deactivated (reason: {reason})"],
    ):
        user.is_active = False
        user.ban_reason = reason
        if user.source == User.Source.trle:
            user.is_pending_activation = False
            user.email = ""
            user.first_name = ""
            user.last_name = ""
            user.set_unusable_password()
            user.save()
        else:
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
        user.is_banned = True
        user.ban_reason = reason
        user.save()
    clear_audit_log_action_flags(obj=user)


def confirm_user_email(
    user: User, request: Request | None, token: str
) -> bool:
    if user.is_email_confirmed:
        return True

    if user.generate_email_token() == token:
        user.is_email_confirmed = True
        user.save()

        track_model_creation(
            user,
            request=request,
            change_author=user,
            is_action_required=True,
        )
        return True

    return False
