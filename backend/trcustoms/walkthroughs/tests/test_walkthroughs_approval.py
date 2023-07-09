import pytest
from django.core import mail
from rest_framework import status
from rest_framework.test import APIClient

from trcustoms.audit_logs.models import AuditLog
from trcustoms.conftest import LevelFactory, UserFactory, WalkthroughFactory
from trcustoms.walkthroughs.consts import WalkthroughStatus


@pytest.mark.django_db
def test_walkthrough_approval_requires_login(
    api_client: APIClient,
) -> None:
    walkthrough = WalkthroughFactory()
    resp = api_client.post(
        f"/api/walkthroughs/{walkthrough.id}/approve/", format="json"
    )
    walkthrough.refresh_from_db()
    assert resp.status_code == status.HTTP_401_UNAUTHORIZED, resp.content
    assert resp.json() == {
        "detail": "Authentication credentials were not provided."
    }
    assert walkthrough.status == WalkthroughStatus.DRAFT


@pytest.mark.django_db
def test_walkthrough_approval_rejects_non_admin(
    auth_api_client: APIClient,
) -> None:
    walkthrough = WalkthroughFactory(author=auth_api_client.user)
    resp = auth_api_client.post(
        f"/api/walkthroughs/{walkthrough.id}/approve/", format="json"
    )
    walkthrough.refresh_from_db()
    assert resp.status_code == status.HTTP_403_FORBIDDEN, resp.content
    assert resp.json() == {
        "detail": "You do not have permission to perform this action."
    }
    assert walkthrough.status == WalkthroughStatus.DRAFT


@pytest.mark.django_db
def test_walkthrough_approval_success(
    staff_api_client: APIClient,
) -> None:
    walkthrough = WalkthroughFactory(
        level=LevelFactory(authors=[UserFactory()])
    )
    resp = staff_api_client.post(
        f"/api/walkthroughs/{walkthrough.id}/approve/", format="json"
    )
    audit_log = AuditLog.objects.first()
    walkthrough.refresh_from_db()
    assert resp.status_code == status.HTTP_200_OK, resp.content
    assert resp.json() == {}
    assert walkthrough.status == WalkthroughStatus.APPROVED
    assert audit_log
    assert audit_log.change_type == AuditLog.ChangeType.UPDATE
    assert audit_log.object_id == str(walkthrough.id)
    assert len(mail.outbox) == 2
    assert mail.outbox[0].subject == "[TRCustoms] New walkthrough"
    assert mail.outbox[1].subject == "[TRCustoms] Walkthrough approved"


@pytest.mark.django_db
def test_walkthrough_rejection_requires_login(
    api_client: APIClient,
) -> None:
    walkthrough = WalkthroughFactory(status=WalkthroughStatus.APPROVED)
    resp = api_client.post(
        f"/api/walkthroughs/{walkthrough.id}/reject/", format="json"
    )
    walkthrough.refresh_from_db()
    assert resp.status_code == status.HTTP_401_UNAUTHORIZED, resp.content
    assert resp.json() == {
        "detail": "Authentication credentials were not provided."
    }
    assert walkthrough.status == WalkthroughStatus.APPROVED


@pytest.mark.django_db
def test_walkthrough_rejection_rejects_non_admin(
    auth_api_client: APIClient,
) -> None:
    walkthrough = WalkthroughFactory(
        author=auth_api_client.user, status=WalkthroughStatus.APPROVED
    )
    resp = auth_api_client.post(
        f"/api/walkthroughs/{walkthrough.id}/reject/", format="json"
    )
    walkthrough.refresh_from_db()
    assert resp.status_code == status.HTTP_403_FORBIDDEN, resp.content
    assert resp.json() == {
        "detail": "You do not have permission to perform this action."
    }
    assert walkthrough.status == WalkthroughStatus.APPROVED


@pytest.mark.django_db
def test_walkthrough_rejection_missing_fields(
    staff_api_client: APIClient,
) -> None:
    walkthrough = WalkthroughFactory(status=WalkthroughStatus.APPROVED)
    resp = staff_api_client.post(
        f"/api/walkthroughs/{walkthrough.id}/reject/", format="json"
    )
    assert resp.status_code == status.HTTP_400_BAD_REQUEST, resp.content
    assert resp.json() == {"reason": ["This field is required."]}
    assert walkthrough.status == WalkthroughStatus.APPROVED


@pytest.mark.django_db
def test_walkthrough_rejection_success(
    staff_api_client: APIClient,
) -> None:
    walkthrough = WalkthroughFactory(status=WalkthroughStatus.APPROVED)
    resp = staff_api_client.post(
        f"/api/walkthroughs/{walkthrough.id}/reject/",
        format="json",
        data={"reason": "Bad formatting"},
    )
    audit_log = AuditLog.objects.first()
    walkthrough.refresh_from_db()
    assert resp.status_code == status.HTTP_200_OK, resp.content
    assert resp.json() == {}
    assert walkthrough.status == WalkthroughStatus.REJECTED
    assert walkthrough.rejection_reason == "Bad formatting"
    assert audit_log
    assert audit_log.change_type == AuditLog.ChangeType.UPDATE
    assert audit_log.object_id == str(walkthrough.id)
    assert len(mail.outbox) == 1
    assert mail.outbox[0].subject == "[TRCustoms] Walkthrough rejected"


@pytest.mark.django_db
def test_walkthrough_publishing_requires_login(
    api_client: APIClient,
) -> None:
    walkthrough = WalkthroughFactory()
    resp = api_client.post(
        f"/api/walkthroughs/{walkthrough.id}/publish/", format="json"
    )
    walkthrough.refresh_from_db()
    assert resp.status_code == status.HTTP_401_UNAUTHORIZED, resp.content
    assert resp.json() == {
        "detail": "Authentication credentials were not provided."
    }
    assert walkthrough.status == WalkthroughStatus.DRAFT


@pytest.mark.django_db
def test_walkthrough_approval_rejects_non_owner(
    auth_api_client: APIClient,
) -> None:
    walkthrough = WalkthroughFactory(author=UserFactory())
    resp = auth_api_client.post(
        f"/api/walkthroughs/{walkthrough.id}/approve/", format="json"
    )
    walkthrough.refresh_from_db()
    assert resp.status_code == status.HTTP_403_FORBIDDEN, resp.content
    assert resp.json() == {
        "detail": "You do not have permission to perform this action."
    }
    assert walkthrough.status == WalkthroughStatus.DRAFT


@pytest.mark.django_db
def test_walkthrough_publishing_rejects_non_drafts(
    auth_api_client: APIClient,
) -> None:
    walkthrough = WalkthroughFactory(
        level=LevelFactory(authors=[UserFactory()]),
        status=WalkthroughStatus.REJECTED,
    )
    resp = auth_api_client.post(
        f"/api/walkthroughs/{walkthrough.id}/publish/", format="json"
    )
    audit_log = AuditLog.objects.first()
    walkthrough.refresh_from_db()
    assert resp.status_code == status.HTTP_400_BAD_REQUEST, resp.content
    assert resp.json() == {"detail": "Only drafts can be published."}
    assert walkthrough.status == WalkthroughStatus.REJECTED
    assert not audit_log


@pytest.mark.django_db
def test_walkthrough_publishing_success(
    auth_api_client: APIClient,
) -> None:
    walkthrough = WalkthroughFactory(author=auth_api_client.user)
    resp = auth_api_client.post(
        f"/api/walkthroughs/{walkthrough.id}/publish/", format="json"
    )
    audit_log = AuditLog.objects.first()
    walkthrough.refresh_from_db()
    assert resp.status_code == status.HTTP_200_OK, resp.content
    assert resp.json() == {}
    assert walkthrough.status == WalkthroughStatus.PENDING_APPROVAL
    assert audit_log
    assert audit_log.change_type == AuditLog.ChangeType.UPDATE
    assert audit_log.object_id == str(walkthrough.id)
    assert len(mail.outbox) == 0
