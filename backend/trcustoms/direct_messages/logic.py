from datetime import datetime, time

from django.conf import settings
from django.utils import timezone
from rest_framework.request import Request

from trcustoms.audit_logs.utils import track_model_creation
from trcustoms.direct_messages.models import Message, Thread
from trcustoms.users.models import User, UserSettings


def get_administrator() -> User | None:
    return User.objects.filter(
        username__iexact=settings.MESSAGES_ADMINISTRATOR_USERNAME
    ).first()


def get_daily_limit(user: User) -> int:
    contributions = [
        user.authored_level_count_approved,
        user.rated_level_count or user.reviewed_level_count,
        user.authored_walkthrough_count_approved,
    ]
    return settings.MESSAGES_BASE_DAILY_LIMIT + sum(
        settings.MESSAGES_DAILY_LIMIT_BONUS for count in contributions if count
    )


def get_sent_today(user: User) -> int:
    start_of_day = timezone.make_aware(
        datetime.combine(timezone.localdate(), time.min)
    )
    return Thread.objects.filter(
        starter=user, created__gte=start_of_day
    ).count()


def is_blocked(sender: User, receiver: User) -> bool:
    receiver_settings, _ = UserSettings.objects.get_or_create(user=receiver)
    return receiver_settings.blocked_users.filter(pk=sender.pk).exists()


def can_message(sender: User, receiver: User) -> bool:
    if sender.is_anonymous or sender == receiver or not receiver.is_active:
        return False
    receiver_settings, _ = UserSettings.objects.get_or_create(user=receiver)
    if not receiver_settings.allow_messages:
        return False
    return not is_blocked(sender, receiver)


def can_reply(sender: User, thread: Thread) -> bool:
    if sender == get_administrator():
        return True
    receiver = thread.get_other_participant(sender)
    return (
        receiver is not None
        and receiver.is_active
        and not is_blocked(sender, receiver)
    )


def post_message(
    request: Request, thread: Thread, sender: User, text: str
) -> Message:
    receiver = thread.get_other_participant(sender)
    message = Message.objects.create(
        thread=thread,
        origin_sender=request.user,
        sender=sender,
        receiver=receiver,
        text=text,
    )
    thread.last_message_at = message.created
    thread.save(update_fields=["last_message_at", "last_updated"])
    track_model_creation(
        message,
        request=request,
        changes=[f"Sent from {sender.username}: {text}"],
    )
    return message


def start_thread(
    request: Request, sender: User, receiver: User, subject: str, text: str
) -> Thread:
    thread = Thread.objects.create(
        subject=subject,
        starter=sender,
        recipient=receiver,
        last_message_at=timezone.now(),
    )
    post_message(request, thread, sender, text)
    return thread


def mark_thread_read(thread: Thread, user: User) -> None:
    thread.messages.filter(receiver=user, is_read=False).update(is_read=True)
