import hashlib

from django.db.models.signals import pre_save
from django.dispatch import receiver

from trcustoms.uploads.models import UploadedFile


def needs_recompute(instance: UploadedFile) -> bool:
    """Whether the checksum and size have to be derived from the content.

    Reading the file is expensive - on S3-backed storage it pulls the whole
    object back over the network - so only do it when the content actually
    changed, rather than on every save of the row.
    """
    if instance.pk is None or instance.md5sum is None:
        return True
    stored_name = (
        UploadedFile.objects.filter(pk=instance.pk)
        .values_list("content", flat=True)
        .first()
    )
    return stored_name != instance.content.name


@receiver(pre_save, sender=UploadedFile)
def update_uploaded_file_checksum_and_size(sender, instance, **kwargs):
    if not instance.content:
        instance.md5sum = None
        instance.size = 0
        return

    if not needs_recompute(instance):
        return

    md5 = hashlib.md5()
    for chunk in instance.content.chunks():
        md5.update(chunk)
    instance.md5sum = md5.hexdigest()
    instance.size = instance.content.size
