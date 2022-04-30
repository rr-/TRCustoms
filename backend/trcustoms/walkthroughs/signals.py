from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from trcustoms.walkthroughs.models import Walkthrough


@receiver(post_save, sender=Walkthrough)
def update_walkthrough_author_info_on_walkthrough_save(
    sender, instance, **kwargs
):
    instance.author.update_authored_walkthrough_count()


@receiver(post_delete, sender=Walkthrough)
def update_walkthrough_author_info_on_delete(sender, instance, **kwargs):
    instance.author.update_authored_walkthrough_count()
