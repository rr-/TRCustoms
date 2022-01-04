from django.core.management.base import BaseCommand

from trcustoms.models import UploadedFile
from trcustoms.utils import check_model_references


class Command(BaseCommand):
    help = "Delete unreferenced files."

    def handle(self, *args, **options):
        for uploaded_file in UploadedFile.objects.filter(
            levelfile__isnull=True,
            levelmedium__isnull=True,
            user__isnull=True,
        ):
            md5sum = uploaded_file.md5sum
            self.stdout.write(f"{md5sum}")

            assert not check_model_references(uploaded_file)

            uploaded_file.delete()
