from django.db import models

from trcustoms.models.dates import DatesInfo
from trcustoms.models.users import User


class LevelEngine(DatesInfo):
    name = models.CharField(max_length=100)

    def __str__(self) -> str:
        return self.name


class LevelGenre(DatesInfo):
    name = models.CharField(max_length=100)

    class Meta:
        verbose_name_plural = "Level genres"

    def __str__(self) -> str:
        return self.name


class LevelTag(DatesInfo):
    name = models.CharField(max_length=100)

    def __str__(self) -> str:
        return self.name


class LevelAuthor(DatesInfo):
    name = models.CharField(max_length=100)
    user = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="authors",
    )

    def __str__(self) -> str:
        return self.name


class Level(DatesInfo):
    name = models.CharField(max_length=100)
    description = models.TextField(max_length=5000)
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
    authors = models.ManyToManyField(LevelAuthor, related_name="levels")

    def __str__(self) -> str:
        return f"{self.name}"


class LevelImage(DatesInfo):
    level = models.ForeignKey(Level, on_delete=models.CASCADE)
    image = models.ImageField(blank=True, null=True, upload_to="level_images/")

    def __str__(self) -> str:
        return f"{self.level.name} image ID={self.pk}"


class LevelFile(DatesInfo):
    level = models.ForeignKey(
        Level, on_delete=models.CASCADE, related_name="files"
    )
    file = models.FileField(upload_to="levels/")
    size = models.IntegerField()
    version = models.IntegerField()

    def __str__(self) -> str:
        return f"{self.level.name} file ID={self.pk}"


class LevelDownload(DatesInfo):
    level = models.ForeignKey(Level, on_delete=models.CASCADE)
