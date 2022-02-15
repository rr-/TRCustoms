from django.db import models

from trcustoms.models.level import Level, LevelGenre
from trcustoms.models.util import DatesInfo


class FeaturedLevel(DatesInfo):
    class FeatureType(models.TextChoices):
        MONTHLY_HIDDEN_GEM = ("gem", "Monthly hidden gem")
        LEVEL_OF_THE_DAY = ("lod", "Level of the day")
        BEST_IN_GENRE = ("big", "Best in genre")

    level = models.ForeignKey(
        Level, on_delete=models.CASCADE, related_name="+"
    )
    feature_type = models.CharField(choices=FeatureType.choices, max_length=3)

    chosen_genre = models.ForeignKey(
        LevelGenre,
        on_delete=models.CASCADE,
        related_name="+",
        null=True,
        blank=True,
    )
