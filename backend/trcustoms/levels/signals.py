from django.db.models.signals import (
    m2m_changed,
    post_delete,
    post_save,
    pre_save,
)
from django.dispatch import receiver

from trcustoms.levels.models import Level, LevelFile


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
    instance.level.update_download_count()


@receiver(post_save, sender=LevelFile)
def update_level_last_file(sender, instance, **kwargs):
    instance.level.update_last_file()


@receiver(post_save, sender=Level)
@receiver(m2m_changed, sender=Level.authors.through)
def update_review_rating_class(sender, instance, **kwargs):
    for author in instance.authors.iterator():
        author.update_authored_level_count()
    for review in instance.reviews.iterator():
        review.author.update_reviewed_level_count()


@receiver(post_delete, sender=Level)
def update_review_level_rating_class(sender, instance, **kwargs):
    for author in instance.authors.iterator():
        author.update_authored_level_count()
    for review in instance.reviews.iterator():
        review.author.update_reviewed_level_count()
