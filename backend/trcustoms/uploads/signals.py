import hashlib

from django.db.models.signals import pre_save
from django.dispatch import receiver

from trcustoms.uploads.models import UploadedFile


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
