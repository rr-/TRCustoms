import pytest
from rest_framework import status
from rest_framework.test import APIClient

from trcustoms.conftest import LevelFactory, ReviewFactory, UserFactory
from trcustoms.reviews.models import LevelReview


@pytest.mark.django_db
def test_review_deletion_updates_level_review_count(
    admin_api_client: APIClient,
) -> None:
    level = LevelFactory()
    review = ReviewFactory(level=level)

    response = admin_api_client.delete(
        f"/api/reviews/{review.id}/",
        format="json",
    )
    level.refresh_from_db()

    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert level.reviews.count() == 0  # pylint: disable=no-member
    assert level.review_count == 0


@pytest.mark.django_db
def test_review_deletion_updates_position(
    admin_api_client: APIClient,
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

    admin_api_client.delete(
        f"/api/reviews/{review2.id}/",
        format="json",
    )
    review1.refresh_from_db()
    review3.refresh_from_db()

    assert review1.position == 1
    assert review3.position == 2
    assert review1.last_updated == review1_last_updated
    assert review3.last_updated == review3_last_updated
    assert not LevelReview.objects.filter(pk=review2.pk).exists()
