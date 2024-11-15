from django.db import models


class RatingType(models.TextChoices):
    TRLE = ("le", "Legacy (TRLE.net)")
    TRC = ("mo", "Modern (TRCustoms)")
