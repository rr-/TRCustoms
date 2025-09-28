import re
from datetime import datetime, timezone
from unittest.mock import patch

import pytest
from django.core import mail
from mimesis import Generic
from rest_framework import status
from rest_framework.test import APIClient

from trcustoms.audit_logs.consts import ChangeType
from trcustoms.audit_logs.models import AuditLog
from trcustoms.audit_logs.utils import make_audit_log
from trcustoms.levels.tests.factories import LevelFactory
from trcustoms.users.consts import UserSource
from trcustoms.users.models import User
from trcustoms.users.tests.factories import UserFactory

VALID_PASSWORD = "Test123!"


@pytest.mark.django_db
def test_user_email_activation(api_client: APIClient, fake: Generic) -> None:
    payload = {
        "email": fake.person.email(),
        "username": fake.person.username(),
        "password": VALID_PASSWORD,
        "first_name": fake.person.first_name(),
        "last_name": fake.person.last_name(),
        "bio": fake.text.sentence(),
    }
    response = api_client.post("/api/users/", data=payload)
    data = response.json()
    user_id = data["id"]
    match = re.search(r'/email-confirmation/([^">\s]+)', mail.outbox[0].body)
    token = match.group(1)

    response = api_client.post(
        "/api/users/confirm_email/", data={"token": token}
    )
    user = User.objects.get(pk=user_id)

    assert response.status_code == status.HTTP_200_OK, response.content
    assert user.is_pending_activation
    assert not user.is_active
    assert user.is_email_confirmed
    assert AuditLog.objects.count() == 1
    assert AuditLog.objects.first().is_action_required


@pytest.mark.django_db
def test_user_email_activation_reusing_token(
    api_client: APIClient, fake: Generic
) -> None:
    payload = {
        "email": fake.person.email(),
        "username": fake.person.username(),
        "password": VALID_PASSWORD,
        "first_name": fake.person.first_name(),
        "last_name": fake.person.last_name(),
        "bio": fake.text.sentence(),
    }
    api_client.post("/api/users/", data=payload)
    match = re.search(r'/email-confirmation/([^">\s]+)', mail.outbox[0].body)
    token = match.group(1)

    response = api_client.post(
        "/api/users/confirm_email/", data={"token": token}
    )
    response = api_client.post(
        "/api/users/confirm_email/", data={"token": token}
    )

    assert (
        response.status_code == status.HTTP_400_BAD_REQUEST
    ), response.content
    assert response.json() == {
        "detail": "This token was already used. Please try again."
    }


@pytest.mark.django_db
def test_user_email_activation_invalid_token(
    staff_api_client: APIClient, fake: Generic
) -> None:
    user = UserFactory(
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
def test_user_activation(staff_api_client: APIClient, fake: Generic) -> None:
    user = UserFactory(
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
def test_date_joined_set_on_activation(
    staff_api_client: APIClient, fake: Generic
) -> None:
    user = UserFactory(
        email=fake.person.email(),
        username=fake.person.username(),
        is_pending_activation=True,
        is_active=False,
        is_email_confirmed=True,
    )
    assert user.date_joined is None
    fixed_now = datetime(2021, 1, 1, 0, 0, 0, tzinfo=timezone.utc)
    with patch("trcustoms.users.logic.timezone.now", return_value=fixed_now):
        response = staff_api_client.post(
            f"/api/users/{user.id}/activate/", data={"reason": "activation"}
        )
    data = response.json()
    assert response.status_code == status.HTTP_200_OK, data
    assert data == {}
    user.refresh_from_db()
    assert user.date_joined == fixed_now


@pytest.mark.django_db
def test_user_rejection(staff_api_client: APIClient, fake: Generic) -> None:
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
def test_user_deactivation(staff_api_client: APIClient) -> None:
    user = UserFactory(
        username="user_to_be_deactivated",
        is_pending_activation=False,
        is_active=True,
    )

    make_audit_log(
        obj=user,
        request=None,
        change_type=ChangeType.CREATE,
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


@pytest.mark.django_db
def test_important_user_email_late_or_uncached_activation(
    api_client: APIClient, staff_api_client: APIClient, fake: Generic
) -> None:
    # Create a TRLE user
    user = UserFactory(
        username=fake.person.username(),
        source=UserSource.trle,
        is_active=False,
    )
    user.date_joined = datetime(1990, 1, 1, tzinfo=timezone.utc)
    user.set_unusable_password()
    user.save()
    # Add some asset to this user, ensuring rejection will trigger a wipe
    # instead of deletion
    LevelFactory(authors=[user])

    # Claim the TRLE user
    payload = {
        "email": fake.person.email(),
        "username": user.username,
        "password": VALID_PASSWORD,
    }
    response = api_client.post("/api/users/", data=payload)
    data = response.json()
    assert response.status_code == status.HTTP_201_CREATED, data
    assert len(mail.outbox) == 1
    match = re.search(r'/email-confirmation/([^">\s]+)', mail.outbox[0].body)
    token = match.group(1)

    # Reject the user BEFORE they activate the account
    response = staff_api_client.post(
        f"/api/users/{user.pk}/deactivate/",
        data={"reason": "no reason"},
    )
    data = response.json()
    assert response.status_code == status.HTTP_200_OK, data
    assert data == {}

    # Assert the account is still out there even after rejection
    assert User.objects.filter(pk=user.pk).exists()

    # NOW activate the account - assert it failed
    response = api_client.post(
        "/api/users/confirm_email/", data={"token": token}
    )
    assert AuditLog.objects.filter(is_action_required=True).count() == 0
    assert response.status_code == status.HTTP_404_NOT_FOUND, response.content
    assert response.json() == {"detail": "Not found."}
