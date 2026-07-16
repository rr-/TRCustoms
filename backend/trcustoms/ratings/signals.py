from django.db.models.signals import (
    m2m_changed,
    post_delete,
    post_save,
    pre_save,
)
from django.dispatch import receiver

from trcustoms.ratings.logic import get_max_rating_score
from trcustoms.ratings.models import (
    Rating,
    RatingTemplateAnswer,
    RatingTemplateQuestion,
)
from trcustoms.scoring import get_object_rating_class
from trcustoms.signals import disable_signals


@receiver(post_save, sender=RatingTemplateQuestion)
@receiver(post_delete, sender=RatingTemplateQuestion)
@receiver(post_save, sender=RatingTemplateAnswer)
@receiver(post_delete, sender=RatingTemplateAnswer)
def clear_max_rating_score_cache(sender, **kwargs) -> None:
    # The rating template (question weights and answer points) is editable
    # config; drop the memoized max score so edits take effect without a
    # worker restart, mirroring scoring.clear_rating_classes_cache.
    get_max_rating_score.cache_clear()


@receiver(pre_save, sender=Rating)
def handle_rating_pre_save(sender, instance, **kwargs):
    if instance.id:
        instance._old_level = Rating.objects.get(id=instance.id).level
    else:
        instance.position = instance.level.ratings.count() + 1


@receiver(post_save, sender=Rating)
@receiver(m2m_changed, sender=Rating.answers.through)
def handle_rating_creation_and_updates(
    sender, instance, action=None, **kwargs
):
    # m2m_changed fires for pre_* and post_* actions alike; only the post_*
    # ones see the final answer set. Recomputing on the pre_* passes (and on
    # add/remove/clear individually) repeats the same N+1 rating aggregation
    # several times per save against intermediate, wrong state. post_save
    # passes no action, so it always runs.
    if action is not None and action not in (
        "post_add",
        "post_remove",
        "post_clear",
    ):
        return
    with disable_signals():
        instance.rating_class = get_object_rating_class(instance)
        instance.save(update_fields=["rating_class", "position"])
        level = instance.level
        level.rating_class = get_object_rating_class(level)
        level.update_rating_count(save=False)
        level.save(update_fields=["rating_class", "rating_count"])
        if old_level := getattr(instance, "_old_level", None):
            old_level.update_rating_count()
        author = instance.author
        author.update_rated_level_count()


@receiver(post_delete, sender=Rating)
def handle_rating_deletion(sender, instance, **kwargs):
    level = instance.level
    level.rating_class = get_object_rating_class(level)
    level.update_rating_count()
    level.save(update_fields=["rating_class"])
    author = instance.author
    author.update_rated_level_count()

    for position, rating in enumerate(
        level.ratings.order_by("created").iterator(), 1
    ):
        if position != rating.position:
            # do not trigger modification time changes
            Rating.objects.filter(pk=rating.pk).update(position=position)
