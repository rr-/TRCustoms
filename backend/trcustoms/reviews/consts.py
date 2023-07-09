from django.db import models


class ReviewType(models.TextChoices):
    TRLE = ("le", "Legacy (TRLE.net)")
    TRC = ("mo", "Modern (TRCustoms)")
