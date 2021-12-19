from django.db import models
from django.db.models import Count

from trcustoms.models.util import DatesInfo


class LevelEngineManager(models.Manager):
    def with_counts(self):
        return self.annotate(level_count=Count("level"))


class LevelEngine(DatesInfo):
    objects = LevelEngineManager()
    name = models.CharField(max_length=100)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return f"{self.name} (id={self.pk})"
