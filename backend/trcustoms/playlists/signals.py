from django.db.models.signals import post_delete, post_save, pre_delete
from django.dispatch import receiver

from trcustoms.playlists.models import PlaylistItem


@receiver(post_save, sender=PlaylistItem)
def update_level_player_on_playlist_item_change(sender, instance, **kwargs):
    instance.user.update_played_level_count()


@receiver(pre_delete, sender=PlaylistItem)
def remember_playlist_item_user(sender, instance, using, **kwargs):
    instance._old_user = instance.user


@receiver(post_delete, sender=PlaylistItem)
def update_level_player_on_playlist_item_delete(sender, instance, **kwargs):
    instance._old_user.update_played_level_count()
