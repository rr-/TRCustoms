import pytest
from rest_framework import status
from rest_framework.test import APIClient

from trcustoms.levels.tests.factories import LevelFactory
from trcustoms.reviews.models import ReviewVote
from trcustoms.reviews.tests.factories import ReviewFactory
from trcustoms.users.tests.factories import UserFactory


@pytest.mark.django_db
def test_review_vote_can_be_added_toggled_and_removed(
    auth_api_client: APIClient,
) -> None:
    review = ReviewFactory()

    upvote_response = auth_api_client.post(
        f"/api/reviews/{review.id}/vote/",
        format="json",
        data={"vote": 1},
    )
    review.refresh_from_db()

    assert upvote_response.status_code == status.HTTP_200_OK
    assert review.upvote_count == 1
    assert review.downvote_count == 0

    downvote_response = auth_api_client.post(
        f"/api/reviews/{review.id}/vote/",
        format="json",
        data={"vote": -1},
    )
    review.refresh_from_db()

    assert downvote_response.status_code == status.HTTP_200_OK
    assert review.upvote_count == 0
    assert review.downvote_count == 1

    remove_response = auth_api_client.post(
        f"/api/reviews/{review.id}/vote/",
        format="json",
        data={"vote": -1},
    )
    review.refresh_from_db()

    assert remove_response.status_code == status.HTTP_200_OK
    assert review.upvote_count == 0
    assert review.downvote_count == 0
    assert not ReviewVote.objects.filter(
        review=review,
        user=auth_api_client.user,
    ).exists()


@pytest.mark.django_db
def test_review_vote_requires_authentication(api_client: APIClient) -> None:
    review = ReviewFactory()

    response = api_client.post(
        f"/api/reviews/{review.id}/vote/",
        format="json",
        data={"vote": 1},
    )

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_review_vote_fails_for_level_author(
    get_auth_api_client,
) -> None:
    author = UserFactory(username="level_author")
    level = LevelFactory(authors=[author])
    review = ReviewFactory(level=level)
    api_client = get_auth_api_client(author)

    response = api_client.post(
        f"/api/reviews/{review.id}/vote/",
        format="json",
        data={"vote": 1},
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json() == {"detail": "You cannot vote on this review."}


@pytest.mark.django_db
def test_review_vote_fails_for_reviewer_on_same_level(
    auth_api_client: APIClient,
) -> None:
    level = LevelFactory()
    ReviewFactory(level=level, author=auth_api_client.user)
    other_review = ReviewFactory(
        level=level,
        author=UserFactory(username="other_reviewer"),
    )

    response = auth_api_client.post(
        f"/api/reviews/{other_review.id}/vote/",
        format="json",
        data={"vote": 1},
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json() == {"detail": "You cannot vote on this review."}


@pytest.mark.django_db
def test_review_vote_fails_after_three_votes_on_same_level(
    auth_api_client: APIClient,
) -> None:
    level = LevelFactory()
    reviews = [ReviewFactory(level=level) for _ in range(4)]
    for review in reviews[:3]:
        auth_api_client.post(
            f"/api/reviews/{review.id}/vote/",
            format="json",
            data={"vote": 1},
        )

    response = auth_api_client.post(
        f"/api/reviews/{reviews[3].id}/vote/",
        format="json",
        data={"vote": 1},
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json() == {
        "detail": "You can only vote on 3 reviews per level."
    }


@pytest.mark.django_db
def test_review_retrieve_includes_current_vote_and_can_vote(
    auth_api_client: APIClient,
) -> None:
    review = ReviewFactory()
    ReviewVote.objects.create(review=review, user=auth_api_client.user, vote=1)

    response = auth_api_client.get(f"/api/reviews/{review.id}/")

    assert response.status_code == status.HTTP_200_OK
    assert response.json()["current_user_vote"] == 1
    assert response.json()["can_vote"] is True
    assert response.json()["upvote_count"] == 1
    assert response.json()["downvote_count"] == 0
