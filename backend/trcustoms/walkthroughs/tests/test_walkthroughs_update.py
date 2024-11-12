from datetime import datetime, timezone
from unittest.mock import Mock, patch

import pytest
from django.core import mail
from rest_framework import status
from rest_framework.test import APIClient

from trcustoms.audit_logs.consts import ChangeType
from trcustoms.audit_logs.models import AuditLog
from trcustoms.levels.tests.factories import LevelFactory
from trcustoms.users.tests.factories import UserFactory
from trcustoms.walkthroughs.consts import WalkthroughStatus, WalkthroughType
from trcustoms.walkthroughs.models import Walkthrough
from trcustoms.walkthroughs.tests.factories import WalkthroughFactory


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
def test_walkthrough_update_allows_edits_from_staff(
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
@pytest.mark.parametrize(
    "test_data",
    [
        Mock(
            status=WalkthroughStatus.APPROVED,
            expected_mail=True,
            expected_last_user_contend_updated_change=True,
        ),
        Mock(
            status=WalkthroughStatus.PENDING_APPROVAL,
            expected_mail=False,
            expected_last_user_contend_updated_change=False,
        ),
    ],
)
def test_walkthrough_update_success(
    test_data: Mock,
    any_object,
    any_integer,
    any_datetime,
    auth_api_client: APIClient,
) -> None:
    level = LevelFactory(authors=[UserFactory(username="example")])
    walkthrough = WalkthroughFactory(
        level=level,
        author=auth_api_client.user,
        text="old text",
        walkthrough_type=WalkthroughType.TEXT,
        status=test_data.status,
    )

    with patch(
        "trcustoms.walkthroughs.serializers.timezone.now",
        **{"return_value": datetime(2024, 1, 1, tzinfo=timezone.utc)},
    ):
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
        "last_user_content_updated": any_datetime(allow_strings=True),
    }

    assert walkthrough.level.id == level.id
    assert walkthrough.walkthrough_type == WalkthroughType.LINK
    assert walkthrough.text == "https://example.com/new/"

    if test_data.expected_last_user_contend_updated_change:
        assert walkthrough.last_user_content_updated == datetime(
            2024, 1, 1, tzinfo=timezone.utc
        )
    else:
        assert walkthrough.last_user_content_updated == walkthrough.created

    assert audit_log
    assert audit_log.change_type == ChangeType.UPDATE
    assert audit_log.object_id == str(walkthrough.id)

    if test_data.expected_mail:
        assert len(mail.outbox) == 1
        assert mail.outbox[0].subject == "[TRCustoms] Walkthrough edited"
    else:
        assert len(mail.outbox) == 0
