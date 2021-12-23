from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from trcustoms.models import LevelFile


@receiver(pre_save, sender=LevelFile)
def update_file_size_and_version(sender, instance, **kwargs):
    if instance.version is None:
        max_version = (
            instance.level.files.exclude(pk=instance.pk)
            .values_list("version", flat=True)
            .order_by("-version")
            .first()
            or 0
        )
        instance.version = max_version + 1
    if instance.file:
        instance.size = instance.file.size
    else:
        instance.size = 0


@receiver(post_save, sender=LevelFile)
def update_level_download_count(sender, instance, **kwargs):
    level = instance.level
    level.download_count = max(
        level.files.values_list("download_count", flat=True)
    )
    level.save()
