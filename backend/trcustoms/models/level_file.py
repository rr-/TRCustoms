from django.db import models
from django.db.models import UniqueConstraint

from trcustoms.models.level import Level
from trcustoms.models.uploaded_file import UploadedFile
from trcustoms.models.util import DatesInfo


class LevelFile(DatesInfo):
    level = models.ForeignKey(
        Level, on_delete=models.CASCADE, related_name="files"
    )

    file = models.ForeignKey(
        UploadedFile, blank=True, null=True, on_delete=models.SET_NULL
    )

    version = models.IntegerField()
    download_count = models.IntegerField(default=0)

    class Meta:
        ordering = ["version"]
        constraints = [
            UniqueConstraint(
                "level", "version", name="level_file_version_unique"
            ),
        ]

    def __str__(self) -> str:
        return f"{self.level.name} (file id={self.pk})"
