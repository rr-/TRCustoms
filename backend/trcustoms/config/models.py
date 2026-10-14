from django.db import models

from trcustoms.common.models import DatesInfo
from trcustoms.config.consts import FeatureFlagName


class FeatureFlag(DatesInfo):
    name = models.CharField(
        max_length=50, choices=FeatureFlagName.choices, unique=True
    )
    is_enabled = models.BooleanField(default=False)

    class Meta:
        ordering = ["name"]
        default_permissions = []

    def __str__(self) -> str:
        return self.get_name_display()
