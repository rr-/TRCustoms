from datetime import timedelta

import pytest
from django.utils import timezone

from trcustoms.community_events.tests.factories import EventFactory
from trcustoms.tasks.delete_unreferenced_files import delete_unreferenced_files
from trcustoms.uploads.consts import UploadType
from trcustoms.uploads.models import UploadedFile
from trcustoms.uploads.tests.factories import UploadedFileFactory


def make_old(uploaded_file: UploadedFile) -> UploadedFile:
    UploadedFile.objects.filter(pk=uploaded_file.pk).update(
        created=timezone.now() - timedelta(hours=25)
    )
    return uploaded_file


@pytest.mark.django_db
def test_delete_unreferenced_files_keeps_event_cover_images() -> None:
    event = EventFactory(
        cover_image=UploadedFileFactory(upload_type=UploadType.EVENT_COVER)
    )
    make_old(event.cover_image)
    orphan = make_old(UploadedFileFactory(upload_type=UploadType.EVENT_COVER))

    delete_unreferenced_files()

    assert UploadedFile.objects.filter(pk=event.cover_image.pk).exists()
    assert not UploadedFile.objects.filter(pk=orphan.pk).exists()


@pytest.mark.django_db
def test_delete_unreferenced_files_keeps_recent_files() -> None:
    recent = UploadedFileFactory(upload_type=UploadType.EVENT_COVER)

    delete_unreferenced_files()

    assert UploadedFile.objects.filter(pk=recent.pk).exists()


@pytest.mark.django_db
def test_delete_unreferenced_files_dry_run_deletes_nothing() -> None:
    orphan = make_old(UploadedFileFactory(upload_type=UploadType.EVENT_COVER))

    delete_unreferenced_files(dry_run=True)

    assert UploadedFile.objects.filter(pk=orphan.pk).exists()
