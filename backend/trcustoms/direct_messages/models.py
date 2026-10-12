from django.db import models
from django.db.models import Q

from trcustoms.audit_logs import registry
from trcustoms.common.models import DatesInfo
from trcustoms.users.models import User


class ThreadQuerySet(models.QuerySet):
    def for_participant(self, user: User) -> models.QuerySet:
        return self.filter(Q(starter=user) | Q(recipient=user))


class Thread(DatesInfo):
    objects = ThreadQuerySet.as_manager()

    subject = models.CharField(max_length=100)
    starter = models.ForeignKey(
        User,
        null=True,
        on_delete=models.SET_NULL,
        related_name="started_threads",
    )
    recipient = models.ForeignKey(
        User,
        null=True,
        on_delete=models.SET_NULL,
        related_name="received_threads",
    )
    last_message_at = models.DateTimeField(db_index=True)

    class Meta:
        ordering = ["-last_message_at", "-pk"]
        default_permissions = []

    def __str__(self) -> str:
        return f"{self.subject} (id={self.pk})"

    def get_other_participant(self, user: User) -> User | None:
        return self.recipient if user == self.starter else self.starter


@registry.register_model(
    name_getter=lambda instance: (
        f"#{instance.pk} to {instance.receiver.username}"
        if instance.receiver
        else f"#{instance.pk}"
    ),
)
class Message(DatesInfo):
    thread = models.ForeignKey(
        Thread, on_delete=models.CASCADE, related_name="messages"
    )
    origin_sender = models.ForeignKey(
        User,
        null=True,
        on_delete=models.SET_NULL,
        related_name="+",
    )
    sender = models.ForeignKey(
        User,
        null=True,
        on_delete=models.SET_NULL,
        related_name="sent_messages",
    )
    receiver = models.ForeignKey(
        User,
        null=True,
        on_delete=models.SET_NULL,
        related_name="received_messages",
    )
    text = models.TextField(max_length=1000)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created", "-pk"]
        default_permissions = []

    def __str__(self) -> str:
        return f"Message #{self.pk} in thread #{self.thread_id}"
