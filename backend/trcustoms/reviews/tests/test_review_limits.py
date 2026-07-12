import pytest
from rest_framework import status
from rest_framework.test import APIClient

from trcustoms.levels.tests.factories import LevelFactory
from trcustoms.reviews.models import Review
from trcustoms.reviews.tests.factories import ReviewFactory


@pytest.mark.django_db
def test_review_creation_rejects_text_longer_than_model_limit(
    auth_api_client: APIClient,
) -> None:
    level = LevelFactory()
    max_length = Review._meta.get_field("text").max_length

    response = auth_api_client.post(
        "/api/reviews/",
        format="json",
        data={
            "level_id": level.id,
            "text": "x" * (max_length + 1),
        },
    )
    data = response.json()

    assert response.status_code == status.HTTP_400_BAD_REQUEST, data
    assert data == {
        "text": [
            f"Ensure this field has no more than {max_length} characters."
        ]
    }


@pytest.mark.django_db
def test_review_update_rejects_text_longer_than_model_limit(
    auth_api_client: APIClient,
) -> None:
    review = ReviewFactory(author=auth_api_client.user)
    max_length = Review._meta.get_field("text").max_length

    response = auth_api_client.patch(
        f"/api/reviews/{review.id}/",
        format="json",
        data={
            "level_id": review.level.id,
            "text": "x" * (max_length + 1),
        },
    )
    data = response.json()

    assert response.status_code == status.HTTP_400_BAD_REQUEST, data
    assert data == {
        "text": [
            f"Ensure this field has no more than {max_length} characters."
        ]
    }
