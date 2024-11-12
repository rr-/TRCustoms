import pytest
from rest_framework import status
from rest_framework.test import APIClient

from trcustoms.levels.tests.factories import LevelFactory
from trcustoms.reviews.models import Review
from trcustoms.reviews.tests.factories import ReviewFactory
from trcustoms.users.tests.factories import UserFactory


@pytest.mark.django_db
def test_review_deletion_updates_level_review_count(
    staff_api_client: APIClient,
) -> None:
    level = LevelFactory()
    review = ReviewFactory(level=level)

    response = staff_api_client.delete(
        f"/api/reviews/{review.id}/",
        format="json",
    )
    level.refresh_from_db()

    assert response.status_code == status.HTTP_204_NO_CONTENT, response.content
    assert level.reviews.count() == 0  # pylint: disable=no-member
    assert level.review_count == 0


@pytest.mark.django_db
def test_review_deletion_updates_position(
    staff_api_client: APIClient,
) -> None:
    level = LevelFactory()
    review1 = ReviewFactory(
        level=level, author=UserFactory(username="foo"), position=1
    )
    review2 = ReviewFactory(
        level=level, author=UserFactory(username="bar"), position=2
    )
    review3 = ReviewFactory(
        level=level, author=UserFactory(username="qux"), position=3
    )
    review1_last_updated = review1.last_updated
    review3_last_updated = review3.last_updated

    staff_api_client.delete(
        f"/api/reviews/{review2.id}/",
        format="json",
    )
    review1.refresh_from_db()
    review3.refresh_from_db()

    assert review1.position == 1
    assert review3.position == 2
    assert review1.last_updated == review1_last_updated
    assert review3.last_updated == review3_last_updated
    assert not Review.objects.filter(pk=review2.pk).exists()
