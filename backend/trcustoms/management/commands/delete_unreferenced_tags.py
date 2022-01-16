from django.core.management.base import BaseCommand

from trcustoms.tasks import delete_unreferenced_tags


class Command(BaseCommand):
    help = "Delete unreferenced tags."

    def handle(self, *args, **options):
        delete_unreferenced_tags()
