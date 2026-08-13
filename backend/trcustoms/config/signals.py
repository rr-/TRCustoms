from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from trcustoms.config.views import clear_config_cache
from trcustoms.engines.models import Engine
from trcustoms.genres.models import Genre
from trcustoms.news.models import GlobalMessage
from trcustoms.tags.models import Tag


@receiver(post_save, sender=Tag)
@receiver(post_delete, sender=Tag)
@receiver(post_save, sender=Genre)
@receiver(post_delete, sender=Genre)
@receiver(post_save, sender=Engine)
@receiver(post_delete, sender=Engine)
@receiver(post_save, sender=GlobalMessage)
@receiver(post_delete, sender=GlobalMessage)
def invalidate_config_cache(sender, **kwargs) -> None:
    clear_config_cache()
