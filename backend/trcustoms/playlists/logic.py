from datetime import datetime

from trcustoms.playlists.consts import PlaylistStatus
from trcustoms.playlists.models import PlaylistItem
from trcustoms.users.models import User


def sync_playlist_with_dates_and_level_ids(
    user: User, entries: list[tuple[int, datetime]]
) -> int:
    existing_level_ids = set(
        user.playlist_items.values_list("level_id", flat=True)
    )

    playlist_items_to_create = [
        PlaylistItem(
            user_id=user.pk,
            level_id=level_id,
            status=PlaylistStatus.FINISHED,
        )
        for (level_id, created) in sorted(entries, key=lambda item: item[1])
        if level_id not in existing_level_ids
    ]

    created_playlist_items = PlaylistItem.objects.bulk_create(
        playlist_items_to_create
    )

    # force update auto_now and auto_now_add
    level_id_to_created = dict(entries)
    playlist_items_to_update = [
        PlaylistItem(
            pk=item.pk,
            created=level_id_to_created[item.level_id],
            last_updated=level_id_to_created[item.level_id],
        )
        for item in created_playlist_items
    ]

    PlaylistItem.objects.bulk_update(
        playlist_items_to_update, fields=["last_updated", "created"]
    )

    user.update_played_level_count()
    return len(playlist_items_to_create)


def sync_playlist_with_reviews(user: User) -> int:
    return sync_playlist_with_dates_and_level_ids(
        user,
        [
            (review.level_id, review.created)
            for review in user.reviewed_levels.iterator()
        ],
    )


def sync_playlist_with_ratings(user: User) -> int:
    return sync_playlist_with_dates_and_level_ids(
        user,
        [
            (rating.level_id, rating.created)
            for rating in user.rated_levels.iterator()
        ],
    )
