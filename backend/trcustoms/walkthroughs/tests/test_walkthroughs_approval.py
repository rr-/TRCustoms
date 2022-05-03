import pytest
from django.core import mail
from rest_framework import status
from rest_framework.test import APIClient

from trcustoms.audit_logs.models import AuditLog
from trcustoms.conftest import WalkthroughFactory


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
    assert walkthrough.is_pending_approval
    assert not walkthrough.is_approved


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
    assert walkthrough.is_pending_approval
    assert not walkthrough.is_approved


@pytest.mark.django_db
def test_walkthrough_approval_success(
    admin_api_client: APIClient,
) -> None:
    walkthrough = WalkthroughFactory()
    resp = admin_api_client.post(
        f"/api/walkthroughs/{walkthrough.id}/approve/", format="json"
    )
    audit_log = AuditLog.objects.first()
    walkthrough.refresh_from_db()
    assert resp.status_code == status.HTTP_200_OK, resp.content
    assert resp.json() == {}
    assert not walkthrough.is_pending_approval
    assert walkthrough.is_approved
    assert audit_log
    assert audit_log.change_type == AuditLog.ChangeType.UPDATE
    assert audit_log.object_id == str(walkthrough.id)
    assert len(mail.outbox) == 1
    assert mail.outbox[0].subject == "[TRCustoms] Walkthrough approved"


@pytest.mark.django_db
def test_walkthrough_rejection_requires_login(
    api_client: APIClient,
) -> None:
    walkthrough = WalkthroughFactory(
        is_approved=True, is_pending_approval=False
    )
    resp = api_client.post(
        f"/api/walkthroughs/{walkthrough.id}/reject/", format="json"
    )
    walkthrough.refresh_from_db()
    assert resp.status_code == status.HTTP_401_UNAUTHORIZED, resp.content
    assert resp.json() == {
        "detail": "Authentication credentials were not provided."
    }
    assert not walkthrough.is_pending_approval
    assert walkthrough.is_approved


@pytest.mark.django_db
def test_walkthrough_rejection_rejects_non_admin(
    auth_api_client: APIClient,
) -> None:
    walkthrough = WalkthroughFactory(
        author=auth_api_client.user,
        is_approved=True,
        is_pending_approval=False,
    )
    resp = auth_api_client.post(
        f"/api/walkthroughs/{walkthrough.id}/reject/", format="json"
    )
    walkthrough.refresh_from_db()
    assert resp.status_code == status.HTTP_403_FORBIDDEN, resp.content
    assert resp.json() == {
        "detail": "You do not have permission to perform this action."
    }
    assert not walkthrough.is_pending_approval
    assert walkthrough.is_approved


@pytest.mark.django_db
def test_walkthrough_rejection_missing_fields(
    admin_api_client: APIClient,
) -> None:
    walkthrough = WalkthroughFactory(
        is_approved=True, is_pending_approval=False
    )
    resp = admin_api_client.post(
        f"/api/walkthroughs/{walkthrough.id}/reject/", format="json"
    )
    assert resp.status_code == status.HTTP_400_BAD_REQUEST, resp.content
    assert resp.json() == {"reason": ["This field is required."]}
    assert not walkthrough.is_pending_approval
    assert walkthrough.is_approved


@pytest.mark.django_db
def test_walkthrough_rejection_success(
    admin_api_client: APIClient,
) -> None:
    walkthrough = WalkthroughFactory(
        is_approved=True, is_pending_approval=False
    )
    resp = admin_api_client.post(
        f"/api/walkthroughs/{walkthrough.id}/reject/",
        format="json",
        data={"reason": "Bad formatting"},
    )
    audit_log = AuditLog.objects.first()
    walkthrough.refresh_from_db()
    assert resp.status_code == status.HTTP_200_OK, resp.content
    assert resp.json() == {}
    assert not walkthrough.is_pending_approval
    assert not walkthrough.is_approved
    assert walkthrough.rejection_reason == "Bad formatting"
    assert audit_log
    assert audit_log.change_type == AuditLog.ChangeType.UPDATE
    assert audit_log.object_id == str(walkthrough.id)
    assert len(mail.outbox) == 1
    assert mail.outbox[0].subject == "[TRCustoms] Walkthrough rejected"
