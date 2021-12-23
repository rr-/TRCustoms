from django.db import models

from trcustoms.models import Level
from trcustoms.models.util import DatesInfo
from trcustoms.utils import RandomFileName


class LevelMedium(DatesInfo):
    level = models.ForeignKey(
        Level, on_delete=models.CASCADE, related_name="media"
    )
    image = models.ImageField(
        blank=True, null=True, upload_to=RandomFileName("level_images")
    )
    position = models.IntegerField(default=1)

    class Meta:
        ordering = ["position"]
        verbose_name_plural = "Level media"

    def __str__(self) -> str:
        return f"{self.level.name} (medium id={self.pk})"
