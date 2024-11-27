import re

import pytest
from django.core import mail
from mimesis import Generic
from rest_framework import status
from rest_framework.test import APIClient

from trcustoms.users.tests.factories import UserFactory
from trcustoms.users.tokens import PasswordResetToken

VALID_PASSWORD = "Test123!"


@pytest.mark.django_db
def test_user_request_password_reset(
    api_client: APIClient, fake: Generic
) -> None:
    user = UserFactory(email=fake.person.email())
    response = api_client.post(
        "/api/users/request_password_reset/",
        data={"email": user.email},
    )
    assert response.status_code == status.HTTP_200_OK, response.content
    assert len(mail.outbox) == 1
    assert mail.outbox[0].subject == "[TRCustoms] Password reset"


@pytest.mark.django_db
def test_user_request_password_reset_reusing_token(
    api_client: APIClient, fake: Generic
) -> None:
    user = UserFactory(email=fake.person.email())
    response = api_client.post(
        "/api/users/request_password_reset/",
        data={"email": user.email},
    )
    match = re.search(r'/password-reset/([^">\s]+)', mail.outbox[0].body)
    token = match.group(1)
    other_password = VALID_PASSWORD + "2"

    api_client.post(
        "/api/users/complete_password_reset/",
        data={"token": token, "password": VALID_PASSWORD},
    )
    response = api_client.post(
        "/api/users/complete_password_reset/",
        data={"token": token, "password": other_password},
    )
    user.refresh_from_db()

    assert (
        response.status_code == status.HTTP_400_BAD_REQUEST
    ), response.content
    assert response.json() == {
        "detail": "This token was already used. Please try again."
    }
    assert user.check_password(VALID_PASSWORD)
    assert not user.check_password(other_password)


@pytest.mark.django_db
def test_user_complete_password_reset(
    api_client: APIClient, fake: Generic
) -> None:
    user = UserFactory(email=fake.person.email())
    response = api_client.post(
        "/api/users/complete_password_reset/",
        data={
            "token": str(PasswordResetToken.for_user(user)),
            "password": VALID_PASSWORD,
        },
    )
    assert response.status_code == status.HTTP_200_OK, response.content
    assert len(mail.outbox) == 0
    user.refresh_from_db()
    assert user.check_password(VALID_PASSWORD)


@pytest.mark.django_db
def test_user_complete_password_reset_invalid_token(
    api_client: APIClient, fake: Generic
) -> None:
    old_password = f"{VALID_PASSWORD}1"
    new_password = f"{VALID_PASSWORD}2"

    user = UserFactory(email=fake.person.email())
    user.set_password(old_password)
    user.save()

    response = api_client.post(
        "/api/users/complete_password_reset/",
        data={
            "token": "bad",
            "password": new_password,
        },
    )
    assert (
        response.status_code == status.HTTP_400_BAD_REQUEST
    ), response.content
    assert len(mail.outbox) == 0
    user.refresh_from_db()
    assert user.check_password(old_password)
    assert not user.check_password(new_password)
