from django.db.models.signals import post_delete, post_save, pre_save
from django.dispatch import receiver

from trcustoms.reviews.logic import update_review_vote_counts
from trcustoms.reviews.models import Review, ReviewVote
from trcustoms.signals import disable_signals


@receiver(pre_save, sender=Review)
def handle_review_pre_save(sender, instance, **kwargs):
    if instance.id:
        old_review = Review.objects.get(id=instance.id)
        instance._old_level = old_review.level
    else:
        instance.position = (
            instance.level.reviews.filter(is_hidden=False).count() + 1
        )


@receiver(post_save, sender=Review)
def handle_review_creation_and_updates(sender, instance, **kwargs):
    with disable_signals():
        level = instance.level
        level.update_review_count()
        if old_level := getattr(instance, "_old_level", None):
            old_level.update_review_count()
        author = instance.author
        author.update_reviewed_level_count()
        refresh_review_positions(level)
        if old_level and old_level != level:
            refresh_review_positions(old_level)


@receiver(post_delete, sender=Review)
def handle_review_deletion(sender, instance, **kwargs):
    level = instance.level
    level.update_review_count()
    author = instance.author
    author.update_reviewed_level_count()

    refresh_review_positions(level)


@receiver(post_save, sender=ReviewVote)
def handle_review_vote_save(sender, instance, **kwargs):
    update_review_vote_counts(instance.review)


@receiver(post_delete, sender=ReviewVote)
def handle_review_vote_delete(sender, instance, **kwargs):
    update_review_vote_counts(instance.review)


def refresh_review_positions(level) -> None:
    for position, review in enumerate(
        level.reviews.filter(is_hidden=False).order_by("created").iterator(),
        1,
    ):
        if position != review.position:
            # do not trigger modification time changes
            Review.objects.filter(pk=review.pk).update(position=position)

    Review.objects.filter(level=level, is_hidden=True).exclude(
        position=0
    ).update(position=0)
