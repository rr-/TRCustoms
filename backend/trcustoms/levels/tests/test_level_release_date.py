from datetime import timedelta

import pytest
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from trcustoms.genres.tests.factories import GenreFactory
from trcustoms.levels.tests.factories import LevelFactory, ScreenshotFactory


def in_days(days: int):
    return timezone.localdate() + timedelta(days=days)


def make_level(user, release_date):
    level = LevelFactory(
        authors=[user], genres=[GenreFactory()], release_date=release_date
    )
    for _ in range(3):
        ScreenshotFactory(level=level)
    return level


def patch_release_date(api_client: APIClient, level, release_date):
    return api_client.patch(
        f"/api/levels/{level.id}/",
        format="json",
        data={"release_date": release_date.isoformat()},
    )


@pytest.mark.django_db
def test_scheduled_level_can_be_rescheduled(auth_api_client) -> None:
    level = make_level(auth_api_client.user, in_days(1))

    response = patch_release_date(auth_api_client, level, in_days(7))

    assert response.status_code == status.HTTP_200_OK, response.content
    level.refresh_from_db()
    assert level.release_date == in_days(7)


@pytest.mark.django_db
def test_release_date_cannot_be_too_far_ahead(auth_api_client) -> None:
    level = make_level(auth_api_client.user, in_days(1))

    response = patch_release_date(auth_api_client, level, in_days(8))

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json() == {
        "release_date": ["The release date can be at most 7 days ahead."]
    }


@pytest.mark.django_db
def test_past_release_date_is_moved_to_today(auth_api_client) -> None:
    level = make_level(auth_api_client.user, in_days(1))

    response = patch_release_date(auth_api_client, level, in_days(-3))

    assert response.status_code == status.HTTP_200_OK, response.content
    level.refresh_from_db()
    assert level.release_date == in_days(0)


@pytest.mark.django_db
def test_released_level_release_date_is_locked(auth_api_client) -> None:
    level = make_level(auth_api_client.user, in_days(-1))

    response = patch_release_date(auth_api_client, level, in_days(2))
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json() == {
        "release_date": ["The release date cannot be changed after release."]
    }

    response = patch_release_date(auth_api_client, level, in_days(-1))
    assert response.status_code == status.HTTP_200_OK, response.content


@pytest.mark.django_db
def test_config_exposes_server_date(api_client: APIClient) -> None:
    response = api_client.get("/api/config/")
    data = response.json()

    assert response.status_code == status.HTTP_200_OK, data
    assert data["server_date"] == in_days(0).isoformat()
    assert data["limits"]["max_release_delay_days"] == 7
