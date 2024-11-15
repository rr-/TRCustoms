from django.db.models.signals import post_delete, post_save, pre_save
from django.dispatch import receiver

from trcustoms.reviews.models import Review
from trcustoms.signals import disable_signals


@receiver(pre_save, sender=Review)
def handle_review_pre_save(sender, instance, **kwargs):
    if instance.id:
        instance._old_level = Review.objects.get(id=instance.id).level
    else:
        instance.position = instance.level.reviews.count() + 1


@receiver(post_save, sender=Review)
def handle_review_creation_and_updates(sender, instance, **kwargs):
    with disable_signals():
        instance.save(update_fields=["position"])
        level = instance.level
        level.update_review_count()
        if old_level := getattr(instance, "_old_level", None):
            old_level.update_review_count()
        author = instance.author
        author.update_reviewed_level_count()


@receiver(post_delete, sender=Review)
def handle_review_deletion(sender, instance, **kwargs):
    level = instance.level
    level.update_review_count()
    author = instance.author
    author.update_reviewed_level_count()

    for position, review in enumerate(
        level.reviews.order_by("created").iterator(), 1
    ):
        if position != review.position:
            # do not trigger modification time changes
            Review.objects.filter(pk=review.pk).update(position=position)
