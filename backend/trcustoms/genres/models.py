from django.db import models
from django.db.models import Count, UniqueConstraint
from django.db.models.functions import Lower

from trcustoms.audit_logs import registry
from trcustoms.common.models import DatesInfo


class GenreManager(models.Manager):
    def with_counts(self):
        return self.annotate(level_count=Count("level"))


@registry.register_model(name_getter=lambda instance: instance.name)
class Genre(DatesInfo):
    objects = GenreManager()
    name = models.CharField(max_length=100)
    description = models.TextField(max_length=500)

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "Genres"
        constraints = [
            UniqueConstraint(Lower("name"), name="genre_name_unique"),
        ]
        default_permissions = []

    def __str__(self) -> str:
        return f"{self.name} (id={self.pk})"
