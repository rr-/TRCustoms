from django.db import models
from django.db.models import Count, UniqueConstraint
from django.db.models.functions import Lower

from trcustoms.models.util import DatesInfo


class LevelGenreManager(models.Manager):
    def with_counts(self):
        return self.annotate(level_count=Count("level"))


class LevelGenre(DatesInfo):
    objects = LevelGenreManager()
    name = models.CharField(max_length=100)
    description = models.TextField(max_length=500)

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "Level genres"
        constraints = [
            UniqueConstraint(Lower("name"), name="genre_name_unique"),
        ]

    def __str__(self) -> str:
        return f"{self.name} (id={self.pk})"
