# pylint: disable=unused-import,import-outside-toplevel
from django.apps import AppConfig


class WalkthroughsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "trcustoms.walkthroughs"

    def ready(self):
        import trcustoms.walkthroughs.signals
