# pylint: disable=W0611,C0415
from django.apps import AppConfig
from django.db import models
from rest_framework import serializers

from trcustoms.common.fields import CustomCharField, CustomTextField


class CommonConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "trcustoms.common"

    def ready(self):
        import trcustoms.common.signals  # noqa: F401

        serializers.ModelSerializer.serializer_field_mapping.update(
            {
                models.CharField: CustomCharField,
                models.TextField: CustomTextField,
            }
        )
