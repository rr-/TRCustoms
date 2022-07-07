import pytest
from rest_framework import status
from rest_framework.test import APIClient

from trcustoms.conftest import LevelFactory, ReviewFactory


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
