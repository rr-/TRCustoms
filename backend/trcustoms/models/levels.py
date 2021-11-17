"""Level models."""
from django.db import models

from trcustoms.models.dates import DatesInfo
from trcustoms.models.users import User


class LevelEngine(DatesInfo):
    name = models.CharField(max_length=100)


class LevelCategory(DatesInfo):
    name = models.CharField(max_length=100)


class LevelTag(DatesInfo):
    name = models.CharField(max_length=100)


class Level(DatesInfo):
    name = models.CharField(max_length=100)
    description = models.TextField(max_length=5000)
    categories = models.ManyToManyField(LevelCategory)
    tags = models.ManyToManyField(LevelTag)
    engine = models.ForeignKey(LevelEngine, on_delete=models.PROTECT)
    author_name = models.CharField(max_length=100)
    author_user = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="authored_levels",
    )
    uploader = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="uploaded_levels",
    )


class LevelImage(DatesInfo):
    level = models.ForeignKey(Level, on_delete=models.CASCADE)
    image = models.ImageField(blank=True, null=True, upload_to="level_images/")


class LevelFile(DatesInfo):
    level = models.ForeignKey(Level, on_delete=models.CASCADE)
    file = models.FileField(upload_to="levels/")
    version = models.CharField(max_length=20)


class LevelDownload(DatesInfo):
    level = models.ForeignKey(Level, on_delete=models.CASCADE)
