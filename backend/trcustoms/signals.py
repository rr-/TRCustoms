from django.db.models.signals import pre_save
from django.dispatch import receiver

from trcustoms.models import LevelFile


@receiver(pre_save, sender=LevelFile)
def update_file(sender, instance, **kwargs):
    if instance.version is None:
        max_version = (
            instance.level.files.exclude(pk=instance.pk)
            .values_list("version", flat=True)
            .order_by("-version")
            .first()
            or 0
        )
        instance.version = max_version + 1
    instance.size = instance.file.size
