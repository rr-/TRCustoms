from django.db.models.signals import post_save
from django.dispatch import receiver

from trcustoms.users.models import User, UserSettings


@receiver(post_save, sender=User)
def create_user_settings(
    sender, instance: User, created: bool, **kwargs
) -> None:
    if created:
        UserSettings.objects.create(user=instance)
