from django.db.models.signals import pre_save
from django.dispatch import receiver

from trcustoms.models import LevelFile


@receiver(pre_save, sender=LevelFile)
def update_file_size(sender, instance, **kwargs):
    instance.size = instance.file.size
