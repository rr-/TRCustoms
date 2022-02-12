import pytest
from mimesis import Generic
from rest_framework import status
from rest_framework.test import APIClient

from trcustoms.models import LevelTag
from trcustoms.tests.conftest import LevelFactory, TagFactory


@pytest.mark.django_db
def test_tag_creation_no_auth(
    any_integer, any_datetime, api_client: APIClient, fake: Generic
) -> None:
    """Test that tag creation works and is available to logged-in users."""
    payload = {
        "name": fake.text.word(),
    }
    response = api_client.post("/api/level_tags/", data=payload)
    data = response.json()

    assert response.status_code == status.HTTP_401_UNAUTHORIZED, data


@pytest.mark.django_db
def test_tag_creation(
    any_integer, any_datetime, auth_api_client: APIClient, fake: Generic
) -> None:
    """Test that tag creation works and is available to logged-in users."""
    payload = {
        "name": fake.text.word(),
    }
    response = auth_api_client.post("/api/level_tags/", data=payload)
    data = response.json()

    assert response.status_code == status.HTTP_201_CREATED, data
    assert data == {
        "id": any_integer(),
        "name": payload["name"],
        "created": any_datetime(allow_strings=True),
        "last_updated": any_datetime(allow_strings=True),
    }


@pytest.mark.django_db
def test_tag_creation_duplicate_name(
    tag_factory: TagFactory, auth_api_client: APIClient, fake: Generic
) -> None:
    """Test that tag creation prevents from creating a tag with a duplicate
    name.
    """
    tag_factory(name="winston")
    payload = {"name": "winston"}
    response = auth_api_client.post("/api/level_tags/", data=payload)
    data = response.json()

    assert response.status_code == status.HTTP_400_BAD_REQUEST, data
    assert data == {"name": ["Another tag exists with this name."]}


@pytest.mark.django_db
def test_tag_creation_duplicate_name_case_sensitivity(
    tag_factory: TagFactory, auth_api_client: APIClient, fake: Generic
) -> None:
    """Test that tag creation prevents from creating a tag with a duplicate
    name even if its case does not match.
    """
    tag_factory(name="winston")
    payload = {"name": "WINSTON"}
    response = auth_api_client.post("/api/level_tags/", data=payload)
    data = response.json()

    assert response.status_code == status.HTTP_400_BAD_REQUEST, data
    assert data == {"name": ["Another tag exists with this name."]}


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
    assert not LevelTag.objects.filter(name=tag1.name).exists()
