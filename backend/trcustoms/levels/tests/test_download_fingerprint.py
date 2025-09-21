import hashlib
import tempfile
from pathlib import Path

import pytest
from django.conf import settings
from django.core.cache import cache
from django.test import override_settings
from rest_framework.test import APIClient

from trcustoms.levels.tests.factories import LevelFactory, LevelFileFactory
from trcustoms.uploads.tests.factories import UploadedFileFactory


@pytest.fixture(name="tmp_file")
def fixture_tmp_file() -> Path:
    with tempfile.TemporaryDirectory() as tmpdir:
        file_path = Path(tmpdir) / "foo_file.txt"
        file_path.write_text("foo")
        yield file_path


@pytest.mark.django_db
@override_settings(USE_AWS_STORAGE=False)
@override_settings()
def test_download_fingerprint_prevents_multiple_increments(
    tmp_file, api_client: APIClient
) -> None:
    level_file = LevelFileFactory(
        level=LevelFactory(is_approved=True),
        file=UploadedFileFactory(content=str(tmp_file)),
    )
    initial_count = level_file.download_count
    url = f"/api/level_files/{level_file.pk}/download/"

    # First download should increment count
    response = api_client.get(url, HTTP_USER_AGENT="agent1")
    assert response.status_code == 200
    level_file.refresh_from_db()
    assert level_file.download_count == initial_count + 1

    # Same fingerprint should not increment again
    response = api_client.get(url, HTTP_USER_AGENT="agent1")
    assert response.status_code == 200
    level_file.refresh_from_db()
    assert level_file.download_count == initial_count + 1

    # Different agent should increment count again
    response = api_client.get(url, HTTP_USER_AGENT="agent2")
    assert response.status_code == 200
    level_file.refresh_from_db()
    assert level_file.download_count == initial_count + 2

    # Verify cache key exists and TTL respects expiration setting
    ip = "127.0.0.1"
    raw_fp = f"{ip}:agent2:{level_file.level_id}"
    fp_key = hashlib.sha256(raw_fp.encode("utf-8")).hexdigest()
    key = cache.make_and_validate_key(fp_key, version=None)
    ttl = cache._cache.get_client(key=key).ttl(key)
    assert ttl > 0
    assert ttl <= int(settings.DOWNLOAD_FINGERPRINT_EXPIRATION.total_seconds())
