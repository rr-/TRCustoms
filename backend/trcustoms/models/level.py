from django.db import models

from trcustoms.models.level_engine import LevelEngine
from trcustoms.models.level_genre import LevelGenre
from trcustoms.models.level_tag import LevelTag
from trcustoms.models.user import User
from trcustoms.models.util import DatesInfo


class Level(DatesInfo):
    class Duration(models.TextChoices):
        short = "short", "short"
        medium = "medium", "medium"
        long = "long", "long"
        very_long = "very_long", "very long"

    class Difficulty(models.TextChoices):
        easy = "easy", "easy"
        medium = "medium", "medium"
        hard = "hard", "hard"
        very_hard = "very_hard", "very hard"

    name = models.CharField(max_length=100)
    description = models.TextField(max_length=5000, null=True, blank=True)
    genres = models.ManyToManyField(LevelGenre)
    tags = models.ManyToManyField(LevelTag)
    engine = models.ForeignKey(LevelEngine, on_delete=models.PROTECT)
    uploader = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="uploaded_levels",
    )
    authors = models.ManyToManyField(User, related_name="authored_levels")
    difficulty = models.CharField(
        max_length=10, choices=Difficulty.choices, blank=True, null=True
    )
    duration = models.CharField(
        max_length=10, choices=Duration.choices, blank=True, null=True
    )
    trle_id = models.IntegerField(blank=True, null=True)

    download_count = models.IntegerField(default=0)

    class Meta:
        ordering = ["-created"]

    def __str__(self) -> str:
        return f"{self.name} (id={self.pk})"
