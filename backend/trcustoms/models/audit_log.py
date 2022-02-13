from django.contrib.contenttypes.models import ContentType
from django.db import models

from trcustoms.models.user import User
from trcustoms.models.util import DatesInfo


class AuditLogManager(models.Manager):
    def filter_for_model(self, model: models.Model) -> models.QuerySet:
        return self.filter(
            object_type=ContentType.objects.get_for_model(model),
            object_id=model.id,
        ).order_by("-created")


class AuditLog(DatesInfo):
    objects = AuditLogManager()

    ChangeType = models.TextChoices("ChangeType", "CREATE UPDATE DELETE")

    object_id = models.CharField(max_length=64)
    object_name = models.CharField(max_length=64)
    object_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    changes = models.JSONField()
    meta = models.JSONField()

    change_type = models.CharField(choices=ChangeType.choices, max_length=10)

    change_author = models.ForeignKey(
        User,
        blank=True,
        null=True,
        on_delete=models.SET_NULL,
        related_name="+",
    )

    is_action_required = models.BooleanField(default=False)

    class Meta:
        default_permissions = []

    def __str__(self) -> str:
        return (
            f"{self.change_type.title()} of "
            f"{self.object_type.model.title()} #{self.object_id} "
            f"by {self.change_author.username}"
        )
