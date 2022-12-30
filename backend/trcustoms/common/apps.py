# pylint: disable=unused-import,import-outside-toplevel
from django.apps import AppConfig


class CommonConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "trcustoms.common"

    def ready(self):
        import trcustoms.common.serializers
        import trcustoms.common.signals
