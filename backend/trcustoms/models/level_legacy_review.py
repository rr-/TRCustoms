from django.db import models

from trcustoms.models.level import Level
from trcustoms.models.user import User
from trcustoms.models.util import DatesInfo


class LevelLegacyReview(DatesInfo):
    level = models.ForeignKey(
        Level, on_delete=models.CASCADE, related_name="reviews"
    )
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="reviewed_levels",
    )
    rating_gameplay = models.IntegerField()
    rating_enemies = models.IntegerField()
    rating_atmosphere = models.IntegerField()
    rating_lighting = models.IntegerField()
    text = models.TextField(max_length=5000, null=True, blank=True)
