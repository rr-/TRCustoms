from django.db.models.signals import post_delete, post_save, pre_save
from django.dispatch import receiver

from trcustoms.walkthroughs.models import Walkthrough


@receiver(pre_save, sender=Walkthrough)
def handle_walkthrough_pre_save(sender, instance, **kwargs):
    if instance.id:
        instance._old_level = Walkthrough.objects.get(id=instance.id).level


@receiver(post_save, sender=Walkthrough)
def update_walkthrough_author_info_on_walkthrough_save(
    sender, instance, **kwargs
):
    instance.author.update_authored_walkthrough_count()
    level = instance.level
    level.update_walkthrough_count()
    if old_level := getattr(instance, "_old_level", None):
        old_level.update_walkthrough_count()


@receiver(post_delete, sender=Walkthrough)
def update_walkthrough_author_info_on_delete(sender, instance, **kwargs):
    instance.author.update_authored_walkthrough_count()
    level = instance.level
    level.update_walkthrough_count()
