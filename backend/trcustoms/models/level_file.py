from django.db import models

from trcustoms.models.level import Level
from trcustoms.models.uploaded_file import UploadedFile
from trcustoms.models.util import DatesInfo


class LevelFile(DatesInfo):
    level = models.ForeignKey(
        Level, on_delete=models.CASCADE, related_name="files"
    )

    # TODO: rename me
    new_file = models.ForeignKey(
        UploadedFile, blank=True, null=True, on_delete=models.SET_NULL
    )

    version = models.IntegerField()
    download_count = models.IntegerField(default=0)

    class Meta:
        ordering = ["version"]

    def __str__(self) -> str:
        return f"{self.level.name} (file id={self.pk})"
