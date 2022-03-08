from django.core.management.base import BaseCommand

from trcustoms.tasks import prune_unused_accounts


class Command(BaseCommand):
    help = "Prune unused accounts."

    def handle(self, *args, **options):
        prune_unused_accounts()
