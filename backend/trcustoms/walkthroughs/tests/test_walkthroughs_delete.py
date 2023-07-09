import pytest
from rest_framework import status
from rest_framework.test import APIClient

from trcustoms.audit_logs.models import AuditLog
from trcustoms.conftest import UserFactory, WalkthroughFactory
from trcustoms.walkthroughs.consts import WalkthroughStatus
from trcustoms.walkthroughs.models import Walkthrough


@pytest.mark.django_db
def test_walkthrough_deletion_requires_login(api_client: APIClient) -> None:
    walkthrough = WalkthroughFactory()
    resp = api_client.delete(f"/api/walkthroughs/{walkthrough.id}/")
    assert resp.status_code == status.HTTP_401_UNAUTHORIZED, resp.content
    assert resp.json() == {
        "detail": "Authentication credentials were not provided."
    }
    assert Walkthrough.objects.filter(pk=walkthrough.pk).exists()


@pytest.mark.django_db
def test_walkthrough_deletion_rejects_non_staff(
    auth_api_client: APIClient,
) -> None:
    walkthrough = WalkthroughFactory(author=auth_api_client.user)
    resp = auth_api_client.delete(f"/api/walkthroughs/{walkthrough.id}/")
    assert resp.status_code == status.HTTP_403_FORBIDDEN, resp.content
    assert resp.json() == {
        "detail": "You do not have permission to perform this action."
    }
    assert Walkthrough.objects.filter(pk=walkthrough.pk).exists()


@pytest.mark.django_db
def test_walkthrough_deletion_rejects_staff(
    staff_api_client: APIClient,
) -> None:
    walkthrough = WalkthroughFactory()
    resp = staff_api_client.delete(f"/api/walkthroughs/{walkthrough.id}/")
    assert resp.status_code == status.HTTP_403_FORBIDDEN, resp.content
    assert resp.json() == {
        "detail": "You do not have permission to perform this action."
    }
    assert Walkthrough.objects.filter(pk=walkthrough.pk).exists()


@pytest.mark.django_db
def test_walkthrough_deletion_success(
    superuser_api_client: APIClient,
) -> None:
    walkthrough = WalkthroughFactory()
    resp = superuser_api_client.delete(f"/api/walkthroughs/{walkthrough.id}/")
    audit_log = AuditLog.objects.first()
    assert resp.status_code == status.HTTP_204_NO_CONTENT
    assert not Walkthrough.objects.filter(pk=walkthrough.pk).exists()
    assert audit_log
    assert audit_log.change_type == AuditLog.ChangeType.DELETE
    assert audit_log.object_id == str(walkthrough.id)


@pytest.mark.django_db
def test_walkthrough_deletion_updates_authored_walkthrough_count(
    superuser_api_client: APIClient,
) -> None:
    user = UserFactory()
    walkthrough = WalkthroughFactory(
        author=user, status=WalkthroughStatus.APPROVED
    )
    user.refresh_from_db()
    assert user.authored_walkthrough_count == 1
    superuser_api_client.delete(f"/api/walkthroughs/{walkthrough.id}/")
    user.refresh_from_db()
    assert user.authored_walkthrough_count == 0
