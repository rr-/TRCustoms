from datetime import timedelta

import pytest
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from trcustoms.levels.tests.factories import LevelFactory
from trcustoms.users.tests.factories import UserFactory


def get_level_ids(api_client: APIClient) -> list[int]:
    resp = api_client.get("/api/levels/", data={"disable_paging": "1"})
    assert resp.status_code == status.HTTP_200_OK, resp.content
    return [item["id"] for item in resp.json()["results"]]


def tomorrow():
    return timezone.localdate() + timedelta(days=1)


@pytest.mark.django_db
def test_scheduled_level_hidden_from_anonymous_list(
    api_client: APIClient,
) -> None:
    LevelFactory(release_date=tomorrow())
    released = LevelFactory(release_date=timezone.localdate())

    assert get_level_ids(api_client) == [released.pk]


@pytest.mark.django_db
def test_scheduled_level_hidden_from_other_users(
    get_auth_api_client,
) -> None:
    level = LevelFactory(release_date=tomorrow())
    api_client = get_auth_api_client(UserFactory(username="viewer"))

    assert get_level_ids(api_client) == []
    resp = api_client.get(f"/api/levels/{level.pk}/")
    assert resp.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_scheduled_level_visible_to_author(get_auth_api_client) -> None:
    author = UserFactory(username="author")
    level = LevelFactory(release_date=tomorrow(), authors=[author])
    api_client = get_auth_api_client(author)

    assert get_level_ids(api_client) == [level.pk]
    resp = api_client.get(f"/api/levels/{level.pk}/")
    assert resp.status_code == status.HTTP_200_OK


@pytest.mark.django_db
def test_scheduled_level_visible_to_staff(
    staff_api_client: APIClient,
) -> None:
    level = LevelFactory(release_date=tomorrow())

    assert get_level_ids(staff_api_client) == [level.pk]
    resp = staff_api_client.get(f"/api/levels/{level.pk}/")
    assert resp.status_code == status.HTTP_200_OK
