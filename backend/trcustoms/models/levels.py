from django.db import models

from trcustoms.models.dates import DatesInfo
from trcustoms.models.users import User
from trcustoms.utils import RandomFileName


class LevelEngine(DatesInfo):
    name = models.CharField(max_length=100)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return f"{self.name} (id={self.pk})"


class LevelGenre(DatesInfo):
    name = models.CharField(max_length=100)

    class Meta:
        verbose_name_plural = "Level genres"

    def __str__(self) -> str:
        return f"{self.name} (id={self.pk})"


class LevelTag(DatesInfo):
    name = models.CharField(max_length=100)

    def __str__(self) -> str:
        return f"{self.name} (id={self.pk})"


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
    authors = models.ManyToManyField(User, related_name="levels")
    difficulty = models.CharField(
        max_length=10, choices=Difficulty.choices, blank=True, null=True
    )
    duration = models.CharField(
        max_length=10, choices=Duration.choices, blank=True, null=True
    )
    trle_id = models.IntegerField(blank=True, null=True)

    def __str__(self) -> str:
        return f"{self.name} (id={self.pk})"


class LevelImage(DatesInfo):
    level = models.ForeignKey(Level, on_delete=models.CASCADE)
    image = models.ImageField(
        blank=True, null=True, upload_to=RandomFileName("level_images")
    )
    position = models.IntegerField(default=1)

    def __str__(self) -> str:
        return f"{self.level.name} (image id={self.pk})"


class LevelFile(DatesInfo):
    level = models.ForeignKey(
        Level, on_delete=models.CASCADE, related_name="files"
    )
    file = models.FileField(
        blank=True, null=True, upload_to=RandomFileName("levels")
    )
    size = models.IntegerField()
    version = models.IntegerField()

    def __str__(self) -> str:
        return f"{self.level.name} (file id={self.pk})"


class LevelDownload(DatesInfo):
    level = models.ForeignKey(Level, on_delete=models.CASCADE)
