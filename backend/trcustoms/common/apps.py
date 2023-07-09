from django.apps import AppConfig
from django.db import models
from rest_framework import serializers

from trcustoms.common.fields import CustomCharField, CustomTextField


class CommonConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "trcustoms.common"

    def ready(self):
        serializers.ModelSerializer.serializer_field_mapping.update(
            {
                models.CharField: CustomCharField,
                models.TextField: CustomTextField,
            }
        )
