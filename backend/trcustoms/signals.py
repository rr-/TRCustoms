import hashlib

from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from trcustoms.models import LevelFile, UploadedFile


@receiver(pre_save, sender=UploadedFile)
def update_uploaded_file_checksum_and_size(sender, instance, **kwargs):
    if instance.content:
        md5 = hashlib.md5()
        for chunk in instance.content.chunks():
            md5.update(chunk)
        instance.md5sum = md5.hexdigest()
        instance.size = instance.content.size
    else:
        instance.md5sum = None
        instance.size = 0


@receiver(pre_save, sender=LevelFile)
def update_level_version(sender, instance, **kwargs):
    if instance.version is None:
        max_version = (
            instance.level.files.exclude(pk=instance.pk)
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
