from django.db import models


class LevelLinkType(models.TextChoices):
    SHOWCASE = ("sh", "Showcase")
    MAIN = ("ma", "Main")


class FeatureType(models.TextChoices):
    NEW_RELEASE = ("new_release", "New release")
    MONTHLY_HIDDEN_GEM = ("monthly_hidden_gem", "Monthly hidden gem")
    LEVEL_OF_THE_DAY = ("level_of_the_day", "Level of the day")
    BEST_IN_GENRE = ("best_in_genre", "Best in genre")
