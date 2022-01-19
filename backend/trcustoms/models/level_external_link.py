from django.db import models
from django.db.models import UniqueConstraint
from django.db.models.functions import Lower

from trcustoms.models.level import Level
from trcustoms.models.util import DatesInfo


class LevelExternalLink(DatesInfo):
    class LinkType(models.TextChoices):
        SHOWCASE = ("sh", "Showcase")
        MAIN = ("ma", "Main")

    level = models.ForeignKey(
        Level, on_delete=models.CASCADE, related_name="external_links"
    )
    url = models.URLField(max_length=256)
    position = models.IntegerField()
    link_type = models.CharField(
        choices=LinkType.choices,
        max_length=2,
    )

    class Meta:
        ordering = ["level", "position"]
        constraints = [
            UniqueConstraint(
                "level", Lower("url"), name="level_external_link_unique"
            ),
        ]

    def __str__(self) -> str:
        return f"{self.url} (level_id={self.level.pk})"
