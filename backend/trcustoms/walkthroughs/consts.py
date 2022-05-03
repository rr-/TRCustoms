from django.db import models


class WalkthroughType(models.TextChoices):
    LINK = ("l", "Link")
    TEXT = ("t", "Text")
