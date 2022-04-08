import pytest
from rest_framework import status
from rest_framework.test import APIClient

from trcustoms.conftest import LevelFactory, ReviewFactory, UserFactory
from trcustoms.levels.models import Level


@pytest.mark.django_db
def test_level_deletion_deletes_a_level(
    level_factory: LevelFactory,
    user_factory: UserFactory,
    admin_api_client: APIClient,
) -> None:
    user = user_factory()
    level = level_factory(authors=[user])
    response = admin_api_client.delete(f"/api/levels/{level.id}/")
    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert not Level.objects.filter(pk=level.pk).exists()


@pytest.mark.django_db
def test_level_deletion_updates_authored_level_count(
    level_factory: LevelFactory,
    user_factory: UserFactory,
    admin_api_client: APIClient,
) -> None:
    user = user_factory()
    level = level_factory(authors=[user])
    user.refresh_from_db()
    assert user.authored_level_count == 1
    admin_api_client.delete(f"/api/levels/{level.id}/")
    user.refresh_from_db()
    assert user.authored_level_count == 0


@pytest.mark.django_db
def test_level_deletion_updates_reviewed_level_count(
    level_factory: LevelFactory,
    review_factory: ReviewFactory,
    user_factory: UserFactory,
    admin_api_client: APIClient,
) -> None:
    user = user_factory()
    review = review_factory(author=user)
    level = level_factory(reviews=[review])
    user.refresh_from_db()
    assert user.reviewed_level_count == 1
    admin_api_client.delete(f"/api/levels/{level.id}/")
    user.refresh_from_db()
    assert user.reviewed_level_count == 0
