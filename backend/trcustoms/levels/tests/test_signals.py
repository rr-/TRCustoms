from datetime import datetime, timezone

import pytest

from trcustoms.levels.tests.factories import LevelFactory, LevelFileFactory


@pytest.mark.django_db
def test_deleting_files_updates_last_user_content_updated() -> None:
    level = LevelFactory()

    file1 = LevelFileFactory(
        level=level, created=datetime(2022, 1, 1, tzinfo=timezone.utc)
    )
    file2 = LevelFileFactory(
        level=level, created=datetime(2023, 2, 3, tzinfo=timezone.utc)
    )
    level.refresh_from_db()

    assert file1.created != file2.created
    assert level.last_user_content_updated == file2.created

    file2.delete()
    level.refresh_from_db()

    assert level.last_user_content_updated is None
