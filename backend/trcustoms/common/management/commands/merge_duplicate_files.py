from django.core.management.base import BaseCommand

from trcustoms.tasks import merge_duplicate_files


class Command(BaseCommand):
    help = "Merge duplicate files."

    def handle(self, *args, **options):
        merge_duplicate_files()
