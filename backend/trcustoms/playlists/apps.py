# pylint: disable=unused-import,import-outside-toplevel
from django.apps import AppConfig


class PlaylistsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "trcustoms.playlists"

    def ready(self):
        import trcustoms.playlists.signals  # noqa: F401
