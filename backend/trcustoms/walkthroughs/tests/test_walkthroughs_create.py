import pytest
from django.core import mail
from mimesis import Generic
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
def test_walkthrough_creation_requires_login(api_client: APIClient) -> None:
    resp = api_client.post("/api/walkthroughs/", data={})

    assert resp.status_code == status.HTTP_401_UNAUTHORIZED, resp.content
    assert resp.json() == {
        "detail": "Authentication credentials were not provided."
    }


@pytest.mark.django_db
def test_walkthrough_creation_fails_on_missing_fields(
    auth_api_client: APIClient,
) -> None:
    resp = auth_api_client.post("/api/walkthroughs/", data={})

    assert resp.status_code == status.HTTP_400_BAD_REQUEST, resp.content
    assert resp.json() == {
        "level_id": ["This field is required."],
        "walkthrough_type": ["This field is required."],
        "text": ["This field is required."],
    }


@pytest.mark.django_db
def test_walkthrough_creation_rejects_duplicate_submissions(
    auth_api_client: APIClient,
) -> None:
    level = LevelFactory()
    WalkthroughFactory(
        level=level,
        author=auth_api_client.user,
        walkthrough_type=WalkthroughType.TEXT,
    )

    resp = auth_api_client.post(
        "/api/walkthroughs/",
        format="json",
        data={
            "level_id": level.id,
            "walkthrough_type": "t",
            "text": "test",
        },
    )

    assert resp.status_code == status.HTTP_400_BAD_REQUEST, resp.content
    assert resp.json() == {
        "detail": [
            "You have already posted a walkthrough "
            "of this type for this level."
        ]
    }


@pytest.mark.django_db
def test_walkthrough_creation_rejects_invalid_text(
    auth_api_client: APIClient,
) -> None:
    level = LevelFactory()
    resp = auth_api_client.post(
        "/api/walkthroughs/",
        format="json",
        data={
            "level_id": level.id,
            "walkthrough_type": "l",
            "text": "test",
        },
    )

    assert resp.status_code == status.HTTP_400_BAD_REQUEST, resp.content
    assert resp.json() == {"text": ["Enter a valid URL."]}


@pytest.mark.django_db
def test_walkthrough_creation_allows_different_type_submissions(
    auth_api_client: APIClient,
) -> None:
    level = LevelFactory()
    WalkthroughFactory(
        level=level,
        author=auth_api_client.user,
        walkthrough_type=WalkthroughType.TEXT,
    )

    resp = auth_api_client.post(
        "/api/walkthroughs/",
        format="json",
        data={
            "level_id": level.id,
            "walkthrough_type": "l",
            "text": "https://example.com/",
        },
    )

    assert resp.status_code == status.HTTP_201_CREATED, resp.content
    assert "id" in resp.json()


@pytest.mark.django_db
def test_walkthrough_creation_ignores_spoofed_fields(
    auth_api_client: APIClient,
) -> None:
    spoofed_user = UserFactory(username="spoofed")
    level = LevelFactory()
    payload = {
        "level_id": level.id,
        "walkthrough_type": "l",
        "text": "https://example.com/",
        "user_id": spoofed_user.id,
        "legacy_author_name": "spoofed legacy author name",
        "status": "app",
        "rejection_reason": "spoofed rejection reason",
    }

    resp = auth_api_client.post(
        "/api/walkthroughs/",
        format="json",
        data=payload,
    )
    walkthrough = Walkthrough.objects.first()

    assert resp.status_code == status.HTTP_201_CREATED, resp.content
    assert "id" in resp.json()
    assert walkthrough.author.id != spoofed_user.id
    assert walkthrough.author.id == auth_api_client.user.id
    assert walkthrough.legacy_author_name is None
    assert walkthrough.status == WalkthroughStatus.DRAFT
    assert walkthrough.rejection_reason is None


@pytest.mark.django_db
def test_walkthrough_creation_success(
    auth_api_client: APIClient,
    any_object,
    any_integer,
    any_datetime,
    fake: Generic,
) -> None:
    level = LevelFactory(authors=[UserFactory(username="example")])
    payload = {
        "level_id": level.id,
        "walkthrough_type": "t",
        "text": fake.text.text(),
    }

    resp = auth_api_client.post(
        "/api/walkthroughs/",
        data=payload,
    )
    walkthrough = Walkthrough.objects.first()
    audit_log = AuditLog.objects.first()

    assert resp.status_code == status.HTTP_201_CREATED, resp.content
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

    assert walkthrough.author
    assert walkthrough.author.id == auth_api_client.user.id
    assert walkthrough.level.id == level.id
    assert walkthrough.legacy_author_name is None
    assert walkthrough.status == WalkthroughStatus.DRAFT
    assert walkthrough.rejection_reason is None
    assert walkthrough.walkthrough_type == WalkthroughType.TEXT
    assert walkthrough.text == payload["text"]
    assert walkthrough.last_user_content_updated == walkthrough.created
    assert walkthrough.last_user_content_updated is not None

    assert audit_log
    assert audit_log.change_type == ChangeType.CREATE
    assert audit_log.object_id == str(walkthrough.id)

    assert len(mail.outbox) == 0


@pytest.mark.django_db
@pytest.mark.parametrize(
    "walkthrough_status,expected_all_count,expected_approved_count",
    [
        (WalkthroughStatus.DRAFT, 1, 0),
        (WalkthroughStatus.APPROVED, 1, 1),
    ],
)
def test_walkthrough_creation_updates_authored_walkthrough_count(
    walkthrough_status: WalkthroughStatus,
    expected_all_count: int,
    expected_approved_count: int,
) -> None:
    user = UserFactory()
    WalkthroughFactory(author=user, status=walkthrough_status)
    user.refresh_from_db()
    assert user.authored_walkthrough_count_all == expected_all_count
    assert user.authored_walkthrough_count_approved == expected_approved_count
