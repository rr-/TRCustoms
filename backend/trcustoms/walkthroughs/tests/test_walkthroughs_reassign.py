import pytest
from rest_framework import status
from rest_framework.test import APIClient

from trcustoms.audit_logs.consts import ChangeType
from trcustoms.audit_logs.models import AuditLog
from trcustoms.users.tests.factories import UserFactory
from trcustoms.walkthroughs.consts import WalkthroughStatus, WalkthroughType
from trcustoms.walkthroughs.tests.factories import WalkthroughFactory


def reassign(api_client: APIClient, walkthrough, user):
    return api_client.post(
        f"/api/walkthroughs/{walkthrough.id}/reassign/",
        format="json",
        data={"user_id": user.id},
    )


@pytest.mark.django_db
def test_walkthrough_reassign_by_owner(auth_api_client: APIClient) -> None:
    owner = auth_api_client.user
    new_author = UserFactory(username="new_author")
    walkthrough = WalkthroughFactory(
        author=owner,
        status=WalkthroughStatus.APPROVED,
        walkthrough_type=WalkthroughType.TEXT,
    )
    owner.refresh_from_db()
    assert owner.authored_walkthrough_count_approved == 1

    resp = reassign(auth_api_client, walkthrough, new_author)

    assert resp.status_code == status.HTTP_200_OK, resp.content
    walkthrough.refresh_from_db()
    owner.refresh_from_db()
    new_author.refresh_from_db()
    assert walkthrough.author == new_author
    assert owner.authored_walkthrough_count_all == 0
    assert owner.authored_walkthrough_count_approved == 0
    assert new_author.authored_walkthrough_count_all == 1
    assert new_author.authored_walkthrough_count_approved == 1

    audit_log = AuditLog.objects.first()
    assert audit_log
    assert audit_log.change_type == ChangeType.UPDATE
    assert audit_log.object_id == str(walkthrough.id)
    assert audit_log.change_author == owner
    assert audit_log.changes == [
        f"Reassigned from {owner.username} to new_author"
    ]


@pytest.mark.django_db
def test_walkthrough_reassign_by_staff(staff_api_client: APIClient) -> None:
    walkthrough = WalkthroughFactory(
        author=UserFactory(username="old_author"),
        walkthrough_type=WalkthroughType.LINK,
    )
    new_author = UserFactory(username="new_author")

    resp = reassign(staff_api_client, walkthrough, new_author)

    assert resp.status_code == status.HTTP_200_OK, resp.content
    walkthrough.refresh_from_db()
    assert walkthrough.author == new_author


@pytest.mark.django_db
def test_walkthrough_reassign_rejects_other_users(
    auth_api_client: APIClient,
) -> None:
    old_author = UserFactory(username="old_author")
    walkthrough = WalkthroughFactory(
        author=old_author,
        status=WalkthroughStatus.APPROVED,
        walkthrough_type=WalkthroughType.TEXT,
    )

    resp = reassign(auth_api_client, walkthrough, auth_api_client.user)

    assert resp.status_code == status.HTTP_403_FORBIDDEN, resp.content
    walkthrough.refresh_from_db()
    assert walkthrough.author == old_author


@pytest.mark.django_db
def test_walkthrough_reassign_rejects_duplicate_type(
    auth_api_client: APIClient,
) -> None:
    new_author = UserFactory(username="new_author")
    walkthrough = WalkthroughFactory(
        author=auth_api_client.user, walkthrough_type=WalkthroughType.TEXT
    )
    WalkthroughFactory(
        author=new_author,
        level=walkthrough.level,
        walkthrough_type=WalkthroughType.TEXT,
    )

    resp = reassign(auth_api_client, walkthrough, new_author)

    assert resp.status_code == status.HTTP_400_BAD_REQUEST
    assert resp.json() == {
        "user_id": ["User already has this type of walkthrough."]
    }
    walkthrough.refresh_from_db()
    assert walkthrough.author == auth_api_client.user


@pytest.mark.django_db
def test_walkthrough_reassign_allows_other_type(
    auth_api_client: APIClient,
) -> None:
    new_author = UserFactory(username="new_author")
    walkthrough = WalkthroughFactory(
        author=auth_api_client.user, walkthrough_type=WalkthroughType.TEXT
    )
    WalkthroughFactory(
        author=new_author,
        level=walkthrough.level,
        walkthrough_type=WalkthroughType.LINK,
    )

    resp = reassign(auth_api_client, walkthrough, new_author)

    assert resp.status_code == status.HTTP_200_OK, resp.content


@pytest.mark.django_db
def test_walkthrough_reassign_rejects_same_user(
    auth_api_client: APIClient,
) -> None:
    walkthrough = WalkthroughFactory(
        author=auth_api_client.user, walkthrough_type=WalkthroughType.TEXT
    )

    resp = reassign(auth_api_client, walkthrough, auth_api_client.user)

    assert resp.status_code == status.HTTP_400_BAD_REQUEST
    assert resp.json() == {
        "user_id": ["The walkthrough already belongs to this user."]
    }
