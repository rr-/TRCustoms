# pylint: disable=unused-import,import-outside-toplevel
from django.apps import AppConfig


class ReviewsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "trcustoms.reviews"

    def ready(self):
        import trcustoms.reviews.signals
