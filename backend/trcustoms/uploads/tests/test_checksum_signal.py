import pytest
from django.core.files.base import ContentFile

from trcustoms.uploads.consts import UploadType
from trcustoms.uploads.models import UploadedFile


@pytest.mark.django_db
def test_checksum_is_computed_for_new_content() -> None:
    uploaded = UploadedFile(upload_type=UploadType.ATTACHMENT, size=0)
    uploaded.content = ContentFile(b"hello", name="upload.txt")
    uploaded.save()

    assert uploaded.md5sum == "5d41402abc4b2a76b9719d911017c592"
    assert uploaded.size == 5


@pytest.mark.django_db
def test_checksum_is_not_recomputed_for_unchanged_content() -> None:
    """Re-reading the file on every save means a full download from S3."""
    uploaded = UploadedFile(upload_type=UploadType.ATTACHMENT, size=0)
    uploaded.content = ContentFile(b"hello", name="upload.txt")
    uploaded.save()

    UploadedFile.objects.filter(pk=uploaded.pk).update(md5sum="sentinel")
    uploaded.md5sum = "sentinel"
    uploaded.save()

    uploaded.refresh_from_db()
    assert uploaded.md5sum == "sentinel"


@pytest.mark.django_db
def test_checksum_is_recomputed_when_content_changes() -> None:
    uploaded = UploadedFile(upload_type=UploadType.ATTACHMENT, size=0)
    uploaded.content = ContentFile(b"hello", name="upload.txt")
    uploaded.save()

    uploaded.content = ContentFile(b"goodbye", name="upload.txt")
    uploaded.save()

    assert uploaded.md5sum != "5d41402abc4b2a76b9719d911017c592"
    assert uploaded.size == 7
