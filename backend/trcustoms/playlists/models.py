from django.db import models
from django.db.models import UniqueConstraint

from trcustoms.common.models import DatesInfo
from trcustoms.levels.models import Level
from trcustoms.playlists.consts import PlaylistStatus
from trcustoms.users.models import User


class PlaylistItemQuerySet(models.QuerySet):
    def finished(self) -> models.QuerySet:
        return self.filter(status=PlaylistStatus.FINISHED)

    def played(self) -> models.QuerySet:
        return self.filter(
            status__in=[
                PlaylistStatus.FINISHED,
                PlaylistStatus.PLAYING,
                PlaylistStatus.DROPPED,
                PlaylistStatus.ON_HOLD,
            ]
        )


class PlaylistItem(DatesInfo):
    objects = PlaylistItemQuerySet.as_manager()

    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="playlist_items"
    )
    level = models.ForeignKey(
        Level, on_delete=models.CASCADE, related_name="playlist_items"
    )
    status = models.CharField(
        choices=PlaylistStatus.choices,
        max_length=15,
    )

    class Meta:
        ordering = ["-created"]
        constraints = [
            UniqueConstraint(
                "level", "user", name="playlist_level_user_unique"
            ),
        ]
        default_permissions = []

    def __str__(self) -> str:
        return (
            f"Playlist item #{self.pk} (user={self.user} level={self.level})"
        )
