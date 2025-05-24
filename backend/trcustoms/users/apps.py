# pylint: disable=unused-import,import-outside-toplevel
from django.apps import AppConfig


class UsersConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "trcustoms.users"

    def ready(self):
        import trcustoms.users.signals  # noqa: F401
