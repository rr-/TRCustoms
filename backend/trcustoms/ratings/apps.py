# pylint: disable=unused-import,import-outside-toplevel
from django.apps import AppConfig


class RatingsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "trcustoms.ratings"

    def ready(self):
        import trcustoms.ratings.signals  # noqa: F401
