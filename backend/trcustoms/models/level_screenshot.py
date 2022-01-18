from django.db import models

from trcustoms.models.level import Level
from trcustoms.models.uploaded_file import UploadedFile
from trcustoms.models.util import DatesInfo


class LevelScreenshot(DatesInfo):
    level = models.ForeignKey(
        Level, on_delete=models.CASCADE, related_name="screenshots"
    )

    file = models.ForeignKey(
        UploadedFile, blank=True, null=True, on_delete=models.SET_NULL
    )
    position = models.IntegerField(default=1)

    class Meta:
        ordering = ["position"]

    def __str__(self) -> str:
        return f"{self.level.name} (screenshot id={self.pk})"
