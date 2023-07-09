import pytest
from django.core import mail
from rest_framework import status
from rest_framework.test import APIClient

from trcustoms.audit_logs.models import AuditLog
from trcustoms.conftest import LevelFactory, UserFactory, WalkthroughFactory
from trcustoms.walkthroughs.consts import WalkthroughStatus, WalkthroughType
from trcustoms.walkthroughs.models import Walkthrough


@pytest.mark.django_db
def test_walkthrough_update_requires_login(
    api_client: APIClient,
) -> None:
    walkthrough = WalkthroughFactory()
    resp = api_client.patch(
        f"/api/walkthroughs/{walkthrough.id}/", format="json", data={}
    )
    assert resp.status_code == status.HTTP_401_UNAUTHORIZED, resp.content
    assert resp.json() == {
        "detail": "Authentication credentials were not provided."
    }


@pytest.mark.django_db
def test_walkthrough_update_rejects_edits_from_non_owner(
    auth_api_client: APIClient,
) -> None:
    walkthrough = WalkthroughFactory(
        author=UserFactory(username="unique user")
    )
    resp = auth_api_client.patch(
        f"/api/walkthroughs/{walkthrough.id}/", format="json", data={}
    )
    assert resp.status_code == status.HTTP_403_FORBIDDEN, resp.content
    assert resp.json() == {
        "detail": "You do not have permission to perform this action."
    }
    assert Walkthrough.objects.filter(pk=walkthrough.pk).exists()


@pytest.mark.django_db
def test_walkthrough_update_allows_edits_from_owner(
    auth_api_client: APIClient,
) -> None:
    walkthrough = WalkthroughFactory(author=auth_api_client.user)
    resp = auth_api_client.patch(
        f"/api/walkthroughs/{walkthrough.id}/", format="json", data={}
    )
    assert resp.status_code == status.HTTP_200_OK, resp.content
    assert "id" in resp.json()
    assert Walkthrough.objects.filter(pk=walkthrough.pk).exists()


@pytest.mark.django_db
def test_walkthrough_update_allows_edits_from_admin(
    staff_api_client: APIClient,
) -> None:
    walkthrough = WalkthroughFactory(
        author=UserFactory(username="unique user")
    )
    resp = staff_api_client.patch(
        f"/api/walkthroughs/{walkthrough.id}/", format="json", data={}
    )
    assert resp.status_code == status.HTTP_200_OK, resp.content
    assert "id" in resp.json()
    assert Walkthrough.objects.filter(pk=walkthrough.pk).exists()


@pytest.mark.django_db
def test_walkthrough_update_rejects_invalid_text(
    auth_api_client: APIClient,
) -> None:
    walkthrough = WalkthroughFactory(author=auth_api_client.user)
    resp = auth_api_client.patch(
        f"/api/walkthroughs/{walkthrough.id}/",
        format="json",
        data={
            "walkthrough_type": "l",
            "text": "test",
        },
    )
    assert resp.status_code == status.HTTP_400_BAD_REQUEST, resp.content
    assert resp.json() == {"text": ["Enter a valid URL."]}


@pytest.mark.django_db
def test_walkthrough_update_ignores_spoofed_fields(
    auth_api_client: APIClient,
) -> None:
    level = LevelFactory(authors=[UserFactory(username="example")])
    walkthrough = WalkthroughFactory(
        level=level,
        author=auth_api_client.user,
        text="old text",
        walkthrough_type=WalkthroughType.TEXT,
    )

    spoofed_user = UserFactory(username="spoofed")
    spoofed_level = LevelFactory()
    payload = {
        "level_id": spoofed_level.id,
        "user_id": spoofed_user.id,
        "legacy_author_name": "spoofed legacy author name",
        "status": "app",
        "rejection_reason": "spoofed rejection reason",
    }

    resp = auth_api_client.patch(
        f"/api/walkthroughs/{walkthrough.id}/",
        format="json",
        data=payload,
    )
    walkthrough = Walkthrough.objects.first()

    assert resp.status_code == status.HTTP_200_OK, resp.content
    assert "id" in resp.json()
    assert walkthrough.author.id != spoofed_user.id
    assert walkthrough.author.id == auth_api_client.user.id
    assert walkthrough.legacy_author_name is None
    assert walkthrough.status == WalkthroughStatus.DRAFT
    assert walkthrough.rejection_reason is None


@pytest.mark.django_db
def test_walkthrough_update_success(
    any_object, any_integer, any_datetime, auth_api_client: APIClient
) -> None:
    level = LevelFactory(authors=[UserFactory(username="example")])
    walkthrough = WalkthroughFactory(
        level=level,
        author=auth_api_client.user,
        text="old text",
        walkthrough_type=WalkthroughType.TEXT,
        status=WalkthroughStatus.APPROVED,
    )

    resp = auth_api_client.patch(
        f"/api/walkthroughs/{walkthrough.id}/",
        format="json",
        data={
            "text": "https://example.com/new/",
            "walkthrough_type": WalkthroughType.LINK,
        },
    )
    walkthrough = Walkthrough.objects.first()
    audit_log = AuditLog.objects.first()

    assert resp.status_code == status.HTTP_200_OK, resp.content
    assert walkthrough
    assert resp.json() == {
        "id": walkthrough.id,
        "level": {
            "id": walkthrough.level.id,
            "name": walkthrough.level.name,
            "cover": any_object(),
        },
        "author": {
            "id": walkthrough.author.id,
            "first_name": walkthrough.author.first_name,
            "last_name": walkthrough.author.last_name,
            "username": walkthrough.author.username,
            "picture": None,
        },
        "legacy_author_name": walkthrough.legacy_author_name,
        "status": walkthrough.status,
        "rejection_reason": walkthrough.rejection_reason,
        "walkthrough_type": walkthrough.walkthrough_type,
        "text": walkthrough.text,
        "created": any_datetime(allow_strings=True),
        "last_updated": any_datetime(allow_strings=True),
    }

    assert walkthrough.level.id == level.id
    assert walkthrough.walkthrough_type == WalkthroughType.LINK
    assert walkthrough.text == "https://example.com/new/"

    assert audit_log
    assert audit_log.change_type == AuditLog.ChangeType.UPDATE
    assert audit_log.object_id == str(walkthrough.id)

    assert len(mail.outbox) == 1
    assert mail.outbox[0].subject == "[TRCustoms] Walkthrough edited"
