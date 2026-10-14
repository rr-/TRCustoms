from django.db import models


class FeatureFlagName(models.TextChoices):
    MESSAGES = "messages", "Messages"
