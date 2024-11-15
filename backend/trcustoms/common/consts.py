from django.db import models


class RatingClassSubject(models.TextChoices):
    LEVEL = ("le", "Level")
    RATING = ("ra", "Rating")
