# pylint: disable=W0611,C0415
from django.apps import AppConfig


class CommonConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "trcustoms.common"

    def ready(self):
        import trcustoms.common.serializers  # noqa: F401
        import trcustoms.common.signals  # noqa: F401
