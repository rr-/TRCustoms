from django.core.management.base import BaseCommand

from trcustoms.signals import disable_signals
from trcustoms.users.models import User


class Command(BaseCommand):
    help = "Recalculate all counts."

    def handle(self, *args, **options):
        with disable_signals():
            for user in User.objects.iterator():
                user.update_authored_level_count()
                user.update_reviewed_level_count()
