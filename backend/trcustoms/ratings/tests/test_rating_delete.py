import pytest
from rest_framework import status
from rest_framework.test import APIClient

from trcustoms.levels.tests.factories import LevelFactory
from trcustoms.ratings.models import Rating
from trcustoms.ratings.tests.factories import RatingFactory
from trcustoms.users.tests.factories import UserFactory


@pytest.mark.django_db
def test_rating_deletion_updates_level_rating_count(
    staff_api_client: APIClient,
) -> None:
    level = LevelFactory()
    rating = RatingFactory(level=level)

    response = staff_api_client.delete(
        f"/api/ratings/{rating.id}/",
        format="json",
    )
    level.refresh_from_db()

    assert response.status_code == status.HTTP_204_NO_CONTENT, response.content
    assert level.ratings.count() == 0  # pylint: disable=no-member
    assert level.rating_count == 0


@pytest.mark.django_db
def test_rating_deletion_updates_position(
    staff_api_client: APIClient,
) -> None:
    level = LevelFactory()
    rating1 = RatingFactory(
        level=level, author=UserFactory(username="foo"), position=1
    )
    rating2 = RatingFactory(
        level=level, author=UserFactory(username="bar"), position=2
    )
    rating3 = RatingFactory(
        level=level, author=UserFactory(username="qux"), position=3
    )
    rating1_last_updated = rating1.last_updated
    rating3_last_updated = rating3.last_updated

    staff_api_client.delete(
        f"/api/ratings/{rating2.id}/",
        format="json",
    )
    rating1.refresh_from_db()
    rating3.refresh_from_db()

    assert rating1.position == 1
    assert rating3.position == 2
    assert rating1.last_updated == rating1_last_updated
    assert rating3.last_updated == rating3_last_updated
    assert not Rating.objects.filter(pk=rating2.pk).exists()
