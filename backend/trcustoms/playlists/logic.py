from trcustoms.playlists.consts import PlaylistStatus
from trcustoms.playlists.models import PlaylistItem
from trcustoms.users.models import User


def sync_playlist_with_reviews(user: User) -> int:
    existing_level_ids = list(
        user.playlist_items.values_list("level_id", flat=True)
    )
    reviews = user.reviewed_levels.exclude(level__pk__in=existing_level_ids)

    playlist_items_to_create = [
        PlaylistItem(
            user_id=user.pk,
            level_id=review.level_id,
            status=PlaylistStatus.FINISHED,
        )
        for review in reviews.order_by("created").iterator()
    ]

    created_playlist_items = PlaylistItem.objects.bulk_create(
        playlist_items_to_create
    )

    # force update auto_now and auto_now_add
    level_id_to_item_id = {
        item.level_id: item.pk for item in created_playlist_items
    }
    playlist_items_to_update = [
        PlaylistItem(
            pk=level_id_to_item_id[review.level_id],
            created=review.created,
            last_updated=review.created,
        )
        for review in reviews.iterator()
    ]

    PlaylistItem.objects.bulk_update(
        playlist_items_to_update, fields=["last_updated", "created"]
    )

    user.update_played_level_count()

    return len(playlist_items_to_create)
