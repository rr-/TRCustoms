from django.db.models.signals import m2m_changed, post_delete, post_save
from django.dispatch import receiver

from trcustoms.ratings import get_level_rating_class, get_review_rating_class
from trcustoms.reviews.models import LevelReview
from trcustoms.signals import disable_signals


@receiver(post_save, sender=LevelReview)
@receiver(m2m_changed, sender=LevelReview.answers.through)
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
