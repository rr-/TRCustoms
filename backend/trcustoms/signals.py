import hashlib
from collections import defaultdict
from contextlib import contextmanager

from django.db.models.signals import (
    m2m_changed,
    post_delete,
    post_init,
    post_migrate,
    post_save,
    pre_delete,
    pre_init,
    pre_migrate,
    pre_save,
)
from django.dispatch import receiver

from trcustoms.models import LevelFile, LevelReview, UploadedFile
from trcustoms.ratings import get_level_rating_class, get_review_rating_class


@contextmanager
def disable_signals():
    stashed_signals = defaultdict(list)
    disabled_signals = [
        pre_init,
        post_init,
        pre_save,
        post_save,
        pre_delete,
        post_delete,
        pre_migrate,
        post_migrate,
        m2m_changed,
    ]

    for signal in disabled_signals:
        stashed_signals[signal] = signal.receivers
        signal.receivers = []

    yield

    for signal in list(stashed_signals):
        signal.receivers = stashed_signals.get(signal, [])
        del stashed_signals[signal]


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


@receiver(post_save, sender=LevelReview)
@receiver(m2m_changed, sender=LevelReview)
def update_review_rating_class(sender, instance, **kwargs):
    with disable_signals():
        instance.rating_class = get_review_rating_class(instance)
        instance.save()
        level = instance.level
        level.rating_class = get_level_rating_class(level)
        level.save(update_fields=["rating_class"])


@receiver(post_delete, sender=LevelReview)
def update_review_level_rating_class(sender, instance, **kwargs):
    level = instance.level
    level.rating_class = get_level_rating_class(level)
    level.save(update_fields=["rating_class"])
