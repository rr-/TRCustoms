import pytest
from mimesis import Generic
from rest_framework import status
from rest_framework.test import APIClient

from trcustoms.conftest import LevelFactory, TagFactory
from trcustoms.tags.models import Tag


@pytest.mark.django_db
def test_tag_merging(
    tag_factory: TagFactory,
    level_factory: LevelFactory,
    admin_api_client: APIClient,
    fake: Generic,
) -> None:
    """Test that tag merging re-adds all old usages to the new tag."""
    level1 = level_factory()
    level2 = level_factory()
    level3 = level_factory()

    tag1 = tag_factory(name="winston")
    tag2 = tag_factory(name="kurtis")

    level1.tags.set([])
    level2.tags.set([tag1])
    level3.tags.set([tag1, tag2])

    response = admin_api_client.post(
        f"/api/level_tags/{tag1.id}/merge/{tag2.id}/"
    )
    data = response.json()

    assert response.status_code == status.HTTP_200_OK, data
    assert data["name"] == "kurtis"

    level1.refresh_from_db()
    level2.refresh_from_db()
    level3.refresh_from_db()

    assert not list(level1.tags.values_list("id", flat=True))
    assert list(level2.tags.values_list("id", flat=True)) == [tag2.id]
    assert list(level3.tags.values_list("id", flat=True)) == [tag2.id]
    assert not Tag.objects.filter(name=tag1.name).exists()
