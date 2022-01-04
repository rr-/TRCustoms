from django.db import models
from django.db.models import Count

from trcustoms.models.util import DatesInfo


class LevelGenreManager(models.Manager):
    def with_counts(self):
        return self.annotate(level_count=Count("level"))


class LevelGenre(DatesInfo):
    objects = LevelGenreManager()
    name = models.CharField(max_length=100)
    description = models.TextField(max_length=500, null=True, blank=True)

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "Level genres"

    def __str__(self) -> str:
        return f"{self.name} (id={self.pk})"
