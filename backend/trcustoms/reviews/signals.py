from django.db.models.signals import (
    m2m_changed,
    post_delete,
    post_save,
    pre_save,
)
from django.dispatch import receiver

from trcustoms.ratings import get_level_rating_class, get_review_rating_class
from trcustoms.reviews.models import LevelReview
from trcustoms.signals import disable_signals


@receiver(pre_save, sender=LevelReview)
def handle_review_pre_save(sender, instance, **kwargs):
    if instance.id:
        instance._old_level = LevelReview.objects.get(id=instance.id).level
    else:
        instance.position = instance.level.reviews.count() + 1


@receiver(post_save, sender=LevelReview)
@receiver(m2m_changed, sender=LevelReview.answers.through)
def handle_review_creation_and_updates(sender, instance, **kwargs):
    with disable_signals():
        instance.rating_class = get_review_rating_class(instance)
        instance.save(update_fields=["rating_class", "position"])
        level = instance.level
        level.rating_class = get_level_rating_class(level)
        level.update_review_count()
        level.save(update_fields=["rating_class"])
        if old_level := getattr(instance, "_old_level", None):
            old_level.update_review_count()
        author = instance.author
        author.update_reviewed_level_count()


@receiver(post_delete, sender=LevelReview)
def handle_review_deletion(sender, instance, **kwargs):
    level = instance.level
    level.rating_class = get_level_rating_class(level)
    level.update_review_count()
    level.save(update_fields=["rating_class"])
    author = instance.author
    author.update_reviewed_level_count()

    for position, review in enumerate(
        level.reviews.order_by("created").iterator(), 1
    ):
        if position != review.position:
            # do not trigger modification time changes
            LevelReview.objects.filter(pk=review.pk).update(position=position)
