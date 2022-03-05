# pylint: disable=unused-import,import-outside-toplevel
from django.apps import AppConfig


class LevelsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "trcustoms.levels"

    def ready(self):
        import trcustoms.levels.signals
