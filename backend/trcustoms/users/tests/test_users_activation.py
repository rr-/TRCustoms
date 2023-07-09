import pytest
from mimesis import Generic
from rest_framework import status
from rest_framework.test import APIClient

from trcustoms.audit_logs.models import AuditLog
from trcustoms.audit_logs.utils import make_audit_log
from trcustoms.conftest import UserFactory
from trcustoms.users.models import User

VALID_PASSWORD = "Test123!"


@pytest.mark.django_db
def test_user_email_activation(
    user_factory: UserFactory,
    staff_api_client: APIClient,
    fake: Generic,
) -> None:
    user = user_factory(
        email=fake.person.email(),
        username=fake.person.username(),
        is_pending_activation=True,
        is_active=False,
        is_email_confirmed=False,
    )

    response = staff_api_client.post(
        "/api/users/confirm_email/",
        data={"token": user.generate_email_token()},
    )
    assert response.status_code == status.HTTP_200_OK, response.content

    user.refresh_from_db()
    assert user.is_pending_activation
    assert not user.is_active
    assert user.is_email_confirmed
    assert AuditLog.objects.count() == 1
    assert AuditLog.objects.first().is_action_required


@pytest.mark.django_db
def test_user_email_activation_invalid_token(
    user_factory: UserFactory,
    staff_api_client: APIClient,
    fake: Generic,
) -> None:
    user = user_factory(
        email=fake.person.email(),
        username=fake.person.username(),
        is_pending_activation=True,
        is_active=False,
        is_email_confirmed=False,
    )

    response = staff_api_client.post(
        "/api/users/confirm_email/",
        data={"token": "bad"},
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST

    user.refresh_from_db()
    assert user.is_pending_activation
    assert not user.is_active
    assert not user.is_email_confirmed
    assert AuditLog.objects.count() == 0


@pytest.mark.django_db
def test_user_activation(
    user_factory: UserFactory,
    staff_api_client: APIClient,
    fake: Generic,
) -> None:
    user = user_factory(
        email=fake.person.email(),
        username=fake.person.username(),
        is_pending_activation=True,
        is_active=False,
        is_email_confirmed=True,
    )

    response = staff_api_client.post(
        f"/api/users/{user.id}/activate/",
        data={"reason": "no reason"},
    )
    data = response.json()
    assert response.status_code == status.HTTP_200_OK, data
    assert data == {}

    user.refresh_from_db()
    assert not user.is_pending_activation
    assert user.is_active
    assert AuditLog.objects.count() == 1
    assert not AuditLog.objects.first().is_action_required


@pytest.mark.django_db
def test_user_rejection(
    staff_api_client: APIClient,
    fake: Generic,
) -> None:
    payload = {
        "email": fake.person.email(),
        "username": fake.person.username(),
        "password": VALID_PASSWORD,
    }
    response = staff_api_client.post("/api/users/", data=payload)
    data = response.json()
    user_id = data["id"]

    assert AuditLog.objects.count() == 0

    response = staff_api_client.post(
        f"/api/users/{user_id}/deactivate/",
        data={"reason": "no reason"},
    )
    data = response.json()
    assert response.status_code == status.HTTP_200_OK, data
    assert data == {}

    assert not User.objects.filter(username=payload["username"]).exists()
    assert AuditLog.objects.count() == 1
    assert not AuditLog.objects.first().is_action_required


@pytest.mark.django_db
def test_user_deactivation(
    staff_api_client: APIClient,
    user_factory: UserFactory,
) -> None:
    user = user_factory(
        username="user_to_be_deactivated",
        is_pending_activation=False,
        is_active=True,
    )

    make_audit_log(
        obj=user,
        request=None,
        change_type=AuditLog.ChangeType.CREATE,
        changes=[],
    )

    response = staff_api_client.post(
        f"/api/users/{user.id}/deactivate/",
        data={"reason": "no reason"},
    )
    data = response.json()
    assert response.status_code == status.HTTP_200_OK, data
    assert data == {}

    assert User.objects.filter(username=user.username).exists()
    assert User.objects.get(username=user.username).is_pending_activation
    assert not User.objects.get(username=user.username).is_active
    assert not AuditLog.objects.first().is_action_required
