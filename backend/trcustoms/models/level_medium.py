from django.db import models

from trcustoms.models.level import Level
from trcustoms.models.uploaded_file import UploadedFile
from trcustoms.models.util import DatesInfo


class LevelMedium(DatesInfo):
    level = models.ForeignKey(
        Level, on_delete=models.CASCADE, related_name="media"
    )

    file = models.ForeignKey(
        UploadedFile, blank=True, null=True, on_delete=models.SET_NULL
    )
    position = models.IntegerField(default=1)

    class Meta:
        ordering = ["position"]
        verbose_name_plural = "Level media"

    def __str__(self) -> str:
        return f"{self.level.name} (medium id={self.pk})"
