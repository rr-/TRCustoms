import pytest
from mimesis import Generic
from rest_framework import status
from rest_framework.test import APIClient

from trcustoms.tags.tests.factories import TagFactory


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
        "level_count": 0,
        "created": any_datetime(allow_strings=True),
        "last_updated": any_datetime(allow_strings=True),
    }


@pytest.mark.django_db
def test_tag_creation_multiple_spaces(
    any_integer, any_datetime, auth_api_client: APIClient, fake: Generic
) -> None:
    """Test that tag creation collapses whitespace."""
    payload = {
        "name": "  foo  bar  ",
    }
    response = auth_api_client.post("/api/level_tags/", data=payload)
    data = response.json()

    assert response.status_code == status.HTTP_201_CREATED, data
    assert data == {
        "id": any_integer(),
        "name": "foo bar",
        "level_count": 0,
        "created": any_datetime(allow_strings=True),
        "last_updated": any_datetime(allow_strings=True),
    }


@pytest.mark.django_db
def test_tag_creation_duplicate_name(
    auth_api_client: APIClient, fake: Generic
) -> None:
    """Test that tag creation prevents from creating a tag with a duplicate
    name.
    """
    TagFactory(name="winston")
    payload = {"name": "winston"}
    response = auth_api_client.post("/api/level_tags/", data=payload)
    data = response.json()

    assert response.status_code == status.HTTP_400_BAD_REQUEST, data
    assert data == {"name": ["Another tag exists with this name."]}


@pytest.mark.django_db
def test_tag_creation_duplicate_name_case_sensitivity(
    auth_api_client: APIClient, fake: Generic
) -> None:
    """Test that tag creation prevents from creating a tag with a duplicate
    name even if its case does not match.
    """
    TagFactory(name="winston")
    payload = {"name": "WINSTON"}
    response = auth_api_client.post("/api/level_tags/", data=payload)
    data = response.json()

    assert response.status_code == status.HTTP_400_BAD_REQUEST, data
    assert data == {"name": ["Another tag exists with this name."]}
