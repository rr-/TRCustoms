import pytest
from mimesis import Generic
from rest_framework import status
from rest_framework.test import APIClient

from trcustoms.users.models import User

VALID_PASSWORD = "Test123!"


@pytest.mark.django_db
def test_user_update_missing_old_password(auth_api_client: APIClient) -> None:
    """Test that user update refuses to update a user if the user didn't supply
    the old password.
    """
    user = auth_api_client.user
    payload = {"password": VALID_PASSWORD}
    response = auth_api_client.patch(f"/api/users/{user.id}/", data=payload)
    data = response.json()

    assert response.status_code == status.HTTP_400_BAD_REQUEST, data
    assert data == {"old_password": ["Password does not match."]}


@pytest.mark.django_db
def test_user_update_bad_old_password(
    auth_api_client: APIClient, fake: Generic
) -> None:
    """Test that user update refuses to update a user if the user didn't supply
    the old password.
    """
    user = auth_api_client.user
    payload = {"old_password": fake.text.word(), "password": VALID_PASSWORD}
    response = auth_api_client.patch(f"/api/users/{user.id}/", data=payload)
    data = response.json()

    assert response.status_code == status.HTTP_400_BAD_REQUEST, data
    assert data == {"old_password": ["Password does not match."]}


@pytest.mark.parametrize(
    "password,expected_message",
    [
        ("", "This field may not be blank."),
        (
            "T1!",
            (
                "This password is too short. "
                "It must contain at least 7 characters."
            ),
        ),
        ("nodigits!", "Passwords must contain at least one digit."),
        (
            "nospecialcharacters123",
            "Passwords must contain at least one special character.",
        ),
    ],
)
@pytest.mark.django_db
def test_user_update_weak_password(
    auth_api_client: APIClient,
    password: str,
    expected_message: str,
) -> None:
    """Test that user update refuses to update a user if the password is too
    weak.
    """
    user = auth_api_client.user
    payload = {"password": password}
    response = auth_api_client.patch(f"/api/users/{user.id}/", data=payload)
    data = response.json()

    assert response.status_code == status.HTTP_400_BAD_REQUEST, data
    assert data == {"password": [expected_message]}


@pytest.mark.django_db
def test_user_update_valid_password(
    auth_api_client: APIClient, fake: Generic
) -> None:
    """Test that user update refuses to update a user if the user didn't supply
    the old password.
    """
    payload = {
        "old_password": VALID_PASSWORD,
        "password": VALID_PASSWORD + "2",
    }
    user = auth_api_client.user
    user.set_password(payload["old_password"])
    user.save()
    response = auth_api_client.patch(f"/api/users/{user.id}/", data=payload)
    data = response.json()

    assert response.status_code == status.HTTP_200_OK, data
    assert User.objects.get(id=data["id"]).check_password(payload["password"])


@pytest.mark.django_db
def test_user_update_spoofing_privileges(auth_api_client: APIClient) -> None:
    """Test that the serializer does not look at the user-supplied payload when
    it comes to security information.
    """
    payload = {
        "is_active": False,
        "is_staff": True,
        "is_pending_activation": True,
    }
    user = auth_api_client.user
    response = auth_api_client.patch(f"/api/users/{user.id}/", data=payload)
    data = response.json()

    assert response.status_code == status.HTTP_200_OK, data
    assert data["is_active"]
    user.refresh_from_db()
    assert user.is_active
    assert not user.is_staff
    assert not user.is_pending_activation
