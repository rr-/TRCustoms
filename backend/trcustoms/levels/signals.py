from django.db.models.signals import (
    m2m_changed,
    post_delete,
    post_save,
    pre_delete,
    pre_save,
)
from django.dispatch import receiver

from trcustoms.levels.models import Level, LevelFile
from trcustoms.users.models import User


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
def update_level_author_info_on_level_change(sender, instance, **kwargs):
    for author in instance.authors.iterator():
        author.update_authored_level_count()


@receiver(post_save, sender=LevelFile)
@receiver(post_delete, sender=LevelFile)
def update_level_update_date_on_files_change(sender, instance, **kwargs):
    instance.level.update_last_user_content_updated()


@receiver(m2m_changed, sender=Level.authors.through)
def update_level_author_info_on_authors_change(
    sender, instance, pk_set, **kwargs
):
    if not pk_set:
        return
    for author in User.objects.filter(id__in=pk_set).iterator():
        author.update_authored_level_count()


@receiver(pre_delete, sender=Level)
def remember_level_authors_and_reviews(sender, instance, using, **kwargs):
    instance._old_authors = instance.authors.all()
    instance._old_reviews = instance.reviews.all()


@receiver(post_delete, sender=Level)
def update_level_author_info_on_delete(sender, instance, **kwargs):
    for author in instance._old_authors:
        author.update_authored_level_count()
    for review in instance._old_reviews:
        review.author.update_reviewed_level_count()
