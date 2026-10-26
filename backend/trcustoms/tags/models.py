from django.db import models
from django.db.models import Count, Q, UniqueConstraint
from django.db.models.functions import Lower
from django.utils import timezone

from trcustoms.audit_logs import registry
from trcustoms.common.models import DatesInfo


class TagManager(models.Manager):
    def with_counts(self):
        return self.annotate(
            level_count=Count(
                "level",
                filter=Q(
                    level__is_approved=True,
                    level__release_date__lte=timezone.localdate(),
                ),
            )
        )


@registry.register_model(name_getter=lambda instance: instance.name)
class Tag(DatesInfo):
    objects = TagManager()
    name = models.CharField(max_length=100)

    class Meta:
        ordering = ["name"]
        constraints = [
            UniqueConstraint(Lower("name"), name="tag_name_unique"),
        ]
        default_permissions = []

    def __str__(self) -> str:
        return f"{self.name} (id={self.pk})"
