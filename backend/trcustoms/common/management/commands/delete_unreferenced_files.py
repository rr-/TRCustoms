from django.core.management.base import BaseCommand

from trcustoms.tasks import delete_unreferenced_files


class Command(BaseCommand):
    help = "Delete unreferenced files."

    def add_arguments(self, parser):
        parser.add_argument("-d", "--dry-run", action="store_true")

    def handle(self, *args, **options):
        delete_unreferenced_files(dry_run=options["dry_run"])
