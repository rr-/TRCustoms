from django.core.management.base import BaseCommand

from trcustoms.tasks import update_featured_levels


class Command(BaseCommand):
    help = "Update featured levels."

    def handle(self, *args, **options):
        update_featured_levels()
