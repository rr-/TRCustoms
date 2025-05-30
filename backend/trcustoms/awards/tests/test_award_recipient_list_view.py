import pytest
from rest_framework import status

from trcustoms.awards.tests.factories import UserAwardFactory
from trcustoms.users.tests.factories import UserFactory


@pytest.mark.django_db
def test_award_recipient_list_allows_anonymous(api_client):
    """GET on AwardRecipientListView allows anonymous access."""
    resp = api_client.get("/api/award_specs/foo/recipients/")
    assert resp.status_code == status.HTTP_200_OK


@pytest.mark.django_db
def test_award_recipient_list_returns_only_for_given_code(
    auth_api_client, any_datetime
):
    """
    GET returns recipients filtered by award code and ordered by creation.
    """
    user1 = UserFactory(username="user1")
    user2 = UserFactory(username="user2")
    award1 = UserAwardFactory(user=user1, code="r1")
    award2 = UserAwardFactory(user=user2, code="r1")
    UserAwardFactory(user=UserFactory(username="other"), code="r2")

    resp = auth_api_client.get("/api/award_specs/r1/recipients/")
    assert resp.status_code == status.HTTP_200_OK, resp.content
    data = resp.json()
    assert data == {
        "current_page": 1,
        "last_page": 1,
        "total_count": 2,
        "items_on_page": 20,
        "next": None,
        "previous": None,
        "results": [
            {
                "user": {
                    "id": award2.user.pk,
                    "username": award2.user.username,
                    "first_name": award2.user.first_name,
                    "last_name": award2.user.last_name,
                    "picture": None,
                },
                "created": any_datetime(allow_strings=True),
            },
            {
                "user": {
                    "id": award1.user.pk,
                    "username": award1.user.username,
                    "first_name": award1.user.first_name,
                    "last_name": award1.user.last_name,
                    "picture": None,
                },
                "created": any_datetime(allow_strings=True),
            },
        ],
        "disable_paging": False,
    }


@pytest.mark.django_db
def test_award_recipient_list_filters_by_tier(auth_api_client, any_datetime):
    """GET honors the 'tier' query parameter for filtering recipients."""
    user0 = UserFactory(username="u0")
    user1 = UserFactory(username="u1")
    user2 = UserFactory(username="u2")
    UserAwardFactory(user=user0, code="tc", tier=None)
    award1 = UserAwardFactory(user=user1, code="tc", tier=1)
    UserAwardFactory(user=user2, code="tc", tier=2)

    resp = auth_api_client.get("/api/award_specs/tc/recipients/?tier=1")
    assert resp.status_code == status.HTTP_200_OK, resp.content
    data = resp.json()
    assert data == {
        "current_page": 1,
        "last_page": 1,
        "total_count": 1,
        "items_on_page": 20,
        "next": None,
        "previous": None,
        "results": [
            {
                "user": {
                    "id": award1.user.pk,
                    "username": award1.user.username,
                    "first_name": award1.user.first_name,
                    "last_name": award1.user.last_name,
                    "picture": None,
                },
                "created": any_datetime(allow_strings=True),
            }
        ],
        "disable_paging": False,
    }


@pytest.mark.django_db
def test_award_recipient_list_invalid_tier_param(auth_api_client):
    """GET with non-integer 'tier' returns a 400 error."""
    resp = auth_api_client.get(
        "/api/award_specs/code_x/recipients/?tier=notint"
    )
    assert resp.status_code == status.HTTP_400_BAD_REQUEST, resp.content
    assert resp.json() == {"detail": "Invalid tier parameter"}
