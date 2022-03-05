from django.core.management.base import BaseCommand

from trcustoms.tasks import delete_unreferenced_files


class Command(BaseCommand):
    help = "Delete unreferenced files."

    def handle(self, *args, **options):
        delete_unreferenced_files()
