import pytest
from rest_framework import status
from rest_framework.test import APIClient

from trcustoms.conftest import LevelFactory, ReviewFactory, UserFactory
from trcustoms.levels.models import Level


@pytest.mark.django_db
def test_level_deletion_requires_login(
    level_factory: LevelFactory,
    api_client: APIClient,
) -> None:
    level = level_factory()
    resp = api_client.delete(f"/api/levels/{level.id}/")
    assert resp.status_code == status.HTTP_401_UNAUTHORIZED, resp.content
    assert resp.json() == {
        "detail": "Authentication credentials were not provided."
    }
    assert Level.objects.filter(pk=level.pk).exists()


@pytest.mark.django_db
def test_walkthrough_deletion_rejects_non_staff(
    level_factory: LevelFactory,
    auth_api_client: APIClient,
) -> None:
    level = level_factory(authors=[auth_api_client.user])
    resp = auth_api_client.delete(f"/api/levels/{level.id}/")
    assert resp.status_code == status.HTTP_403_FORBIDDEN, resp.content
    assert resp.json() == {
        "detail": "You do not have permission to perform this action."
    }
    assert Level.objects.filter(pk=level.pk).exists()


@pytest.mark.django_db
def test_walkthrough_deletion_rejects_staff(
    level_factory: LevelFactory,
    staff_api_client: APIClient,
) -> None:
    level = level_factory()
    resp = staff_api_client.delete(f"/api/levels/{level.id}/")
    assert resp.status_code == status.HTTP_403_FORBIDDEN, resp.content
    assert resp.json() == {
        "detail": "You do not have permission to perform this action."
    }
    assert Level.objects.filter(pk=level.pk).exists()


@pytest.mark.django_db
def test_level_deletion_success(
    level_factory: LevelFactory,
    user_factory: UserFactory,
    superuser_api_client: APIClient,
) -> None:
    user = user_factory()
    level = level_factory(authors=[user])
    resp = superuser_api_client.delete(f"/api/levels/{level.id}/")
    assert resp.status_code == status.HTTP_204_NO_CONTENT
    assert not Level.objects.filter(pk=level.pk).exists()


@pytest.mark.django_db
def test_level_deletion_updates_authored_level_count(
    level_factory: LevelFactory,
    user_factory: UserFactory,
    superuser_api_client: APIClient,
) -> None:
    user = user_factory()
    level = level_factory(authors=[user])
    user.refresh_from_db()
    assert user.authored_level_count == 1
    superuser_api_client.delete(f"/api/levels/{level.id}/")
    user.refresh_from_db()
    assert user.authored_level_count == 0


@pytest.mark.django_db
def test_level_deletion_updates_reviewed_level_count(
    level_factory: LevelFactory,
    review_factory: ReviewFactory,
    user_factory: UserFactory,
    superuser_api_client: APIClient,
) -> None:
    user = user_factory()
    level = level_factory()
    review_factory(level=level)
    user.refresh_from_db()
    assert user.reviewed_level_count == 1
    superuser_api_client.delete(f"/api/levels/{level.id}/")
    user.refresh_from_db()
    assert user.reviewed_level_count == 0
