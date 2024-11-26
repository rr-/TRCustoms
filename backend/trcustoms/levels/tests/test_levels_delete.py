import pytest
from rest_framework import status
from rest_framework.test import APIClient

from trcustoms.levels.models import Level
from trcustoms.levels.tests.factories import LevelFactory
from trcustoms.ratings.tests.factories import RatingFactory
from trcustoms.reviews.tests.factories import ReviewFactory
from trcustoms.users.tests.factories import UserFactory


@pytest.mark.django_db
def test_level_deletion_requires_login(
    api_client: APIClient,
) -> None:
    level = LevelFactory()
    resp = api_client.delete(f"/api/levels/{level.id}/")
    assert resp.status_code == status.HTTP_401_UNAUTHORIZED, resp.content
    assert resp.json() == {
        "detail": "Authentication credentials were not provided."
    }
    assert Level.objects.filter(pk=level.pk).exists()


@pytest.mark.django_db
def test_walkthrough_deletion_rejects_non_staff(
    auth_api_client: APIClient,
) -> None:
    level = LevelFactory(authors=[auth_api_client.user])
    resp = auth_api_client.delete(f"/api/levels/{level.id}/")
    assert resp.status_code == status.HTTP_403_FORBIDDEN, resp.content
    assert resp.json() == {
        "detail": "You do not have permission to perform this action."
    }
    assert Level.objects.filter(pk=level.pk).exists()


@pytest.mark.django_db
def test_walkthrough_deletion_rejects_staff(
    staff_api_client: APIClient,
) -> None:
    level = LevelFactory()
    resp = staff_api_client.delete(f"/api/levels/{level.id}/")
    assert resp.status_code == status.HTTP_403_FORBIDDEN, resp.content
    assert resp.json() == {
        "detail": "You do not have permission to perform this action."
    }
    assert Level.objects.filter(pk=level.pk).exists()


@pytest.mark.django_db
def test_level_deletion_success(
    superuser_api_client: APIClient,
) -> None:
    level = LevelFactory()
    resp = superuser_api_client.delete(f"/api/levels/{level.id}/")
    assert resp.status_code == status.HTTP_204_NO_CONTENT
    assert not Level.objects.filter(pk=level.pk).exists()


@pytest.mark.django_db
def test_level_deletion_updates_authored_level_count(
    superuser_api_client: APIClient,
) -> None:
    user = UserFactory()
    level = LevelFactory(authors=[user])
    user.refresh_from_db()
    assert user.authored_level_count_all == 1
    assert user.authored_level_count_approved == 1
    superuser_api_client.delete(f"/api/levels/{level.id}/")
    user.refresh_from_db()
    assert user.authored_level_count_all == 0
    assert user.authored_level_count_approved == 0


@pytest.mark.django_db
def test_level_deletion_updates_reviewed_level_count(
    superuser_api_client: APIClient,
) -> None:
    user = UserFactory()
    level = LevelFactory()
    ReviewFactory(level=level)
    user.refresh_from_db()
    assert user.reviewed_level_count == 1
    superuser_api_client.delete(f"/api/levels/{level.id}/")
    user.refresh_from_db()
    assert user.reviewed_level_count == 0


@pytest.mark.django_db
def test_level_deletion_updates_rated_level_count(
    superuser_api_client: APIClient,
) -> None:
    user = UserFactory()
    level = LevelFactory()
    RatingFactory(level=level)
    user.refresh_from_db()
    assert user.rated_level_count == 1
    superuser_api_client.delete(f"/api/levels/{level.id}/")
    user.refresh_from_db()
    assert user.rated_level_count == 0
