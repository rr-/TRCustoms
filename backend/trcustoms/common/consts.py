from django.db import models


class RatingClassSubject(models.TextChoices):
    LEVEL = ("le", "Level")
    REVIEW = ("re", "Review")
