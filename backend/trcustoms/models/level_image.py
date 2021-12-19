from django.db import models

from trcustoms.models import Level
from trcustoms.models.util import DatesInfo
from trcustoms.utils import RandomFileName


class LevelImage(DatesInfo):
    level = models.ForeignKey(Level, on_delete=models.CASCADE)
    image = models.ImageField(
        blank=True, null=True, upload_to=RandomFileName("level_images")
    )
    position = models.IntegerField(default=1)

    def __str__(self) -> str:
        return f"{self.level.name} (image id={self.pk})"
