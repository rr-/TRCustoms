from django.core.management.base import BaseCommand

from trcustoms.tasks import delete_stalled_drafts


class Command(BaseCommand):
    help = "Delete old unpublished walkthrough drafts."

    def handle(self, *args, **options):
        delete_stalled_drafts()
