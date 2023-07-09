# pylint: disable=W0611,C0415
from django.apps import AppConfig


class UploadsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "trcustoms.uploads"

    def ready(self):
        import trcustoms.uploads.signals  # noqa: F401
