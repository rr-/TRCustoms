# pylint: disable=unused-import,import-outside-toplevel
from django.apps import AppConfig


class ConfigConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "trcustoms.config"

    def ready(self):
        import trcustoms.config.signals  # noqa: F401
