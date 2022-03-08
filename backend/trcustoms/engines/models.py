from django.db import models
from django.db.models import Count, UniqueConstraint
from django.db.models.functions import Lower

from trcustoms.audit_logs import registry
from trcustoms.common.models import DatesInfo


class EngineManager(models.Manager):
    def with_counts(self):
        return self.annotate(level_count=Count("level"))


@registry.register_model(name_getter=lambda instance: instance.name)
class Engine(DatesInfo):
    objects = EngineManager()
    position = models.IntegerField(default=1)
    name = models.CharField(max_length=100)

    class Meta:
        ordering = ["position"]
        constraints = [
            UniqueConstraint(Lower("name"), name="engine_name_unique"),
        ]
        default_permissions = []

    def __str__(self) -> str:
        return f"{self.name} (id={self.pk})"
