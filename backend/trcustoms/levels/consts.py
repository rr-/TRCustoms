from django.db import models


class LevelLinkType(models.TextChoices):
    SHOWCASE = ("sh", "Showcase")
    MAIN = ("ma", "Main")


class FeatureType(models.TextChoices):
    NEW_RELEASE = ("new", "New release")
    MONTHLY_HIDDEN_GEM = ("gem", "Monthly hidden gem")
    LEVEL_OF_THE_DAY = ("lod", "Level of the day")
    BEST_IN_GENRE = ("big", "Best in genre")
