from django.db import models
from django.db.models import Count, UniqueConstraint
from django.db.models.functions import Lower

from trcustoms.models.util import DatesInfo


class LevelEngineManager(models.Manager):
    def with_counts(self):
        return self.annotate(level_count=Count("level"))


class LevelEngine(DatesInfo):
    objects = LevelEngineManager()
    name = models.CharField(max_length=100)

    class Meta:
        ordering = ["name"]
        constraints = [
            UniqueConstraint(Lower("name"), name="engine_name_unique"),
        ]

    def __str__(self) -> str:
        return f"{self.name} (id={self.pk})"
