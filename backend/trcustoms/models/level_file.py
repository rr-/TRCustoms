from django.db import models

from trcustoms.models.level import Level
from trcustoms.models.util import DatesInfo
from trcustoms.utils import RandomFileName


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
