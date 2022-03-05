from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from trcustoms.levels.models import LevelFile


@receiver(pre_save, sender=LevelFile)
def update_level_version(sender, instance, **kwargs):
    if instance.version is None:
        max_version = (
            instance.level.files.exclude(id=instance.id)
            .values_list("version", flat=True)
            .order_by("-version")
            .first()
            or 0
        )
        instance.version = max_version + 1


@receiver(post_save, sender=LevelFile)
def update_level_download_count(sender, instance, **kwargs):
    level = instance.level
    level.download_count = max(
        level.files.values_list("download_count", flat=True)
    )
    level.save()


@receiver(post_save, sender=LevelFile)
def update_level_last_file(sender, instance, **kwargs):
    level = instance.level
    last_file = level.files.order_by("-version").first()
    if last_file != level.last_file:
        level.last_file = last_file
        level.save()
