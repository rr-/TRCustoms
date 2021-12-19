from django.db import models

from trcustoms.models.level import Level
from trcustoms.models.util import DatesInfo


class LevelDownload(DatesInfo):
    level = models.ForeignKey(Level, on_delete=models.CASCADE)
