from django.db import models

from trcustoms.models.level_difficulty import LevelDifficulty
from trcustoms.models.level_duration import LevelDuration
from trcustoms.models.level_engine import LevelEngine
from trcustoms.models.level_genre import LevelGenre
from trcustoms.models.level_tag import LevelTag
from trcustoms.models.uploaded_file import UploadedFile
from trcustoms.models.user import User
from trcustoms.models.util import DatesInfo


class Level(DatesInfo):
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
    trle_id = models.IntegerField(blank=True, null=True)

    difficulty = models.ForeignKey(
        LevelDifficulty, blank=True, null=True, on_delete=models.SET_NULL
    )
    duration = models.ForeignKey(
        LevelDuration, blank=True, null=True, on_delete=models.SET_NULL
    )

    cover = models.ForeignKey(
        UploadedFile, blank=True, null=True, on_delete=models.SET_NULL
    )

    is_approved = models.BooleanField(default=False)
    rejection_reason = models.CharField(max_length=200, null=True, blank=True)

    # denormalized fields for faster db lookups
    download_count = models.IntegerField(default=0)
    last_file = models.OneToOneField(
        "LevelFile",
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="+",
    )

    class Meta:
        ordering = ["-created"]

    def __str__(self) -> str:
        return f"{self.name} (id={self.pk})"
