from django.db import models

from trcustoms.models.util import DatesInfo


class LevelDuration(DatesInfo):
    name = models.CharField(max_length=100)
    position = models.IntegerField()

    class Meta:
        ordering = ["position"]

    def __str__(self) -> str:
        return f"{self.name} (id={self.pk})"
