import pytest
from rest_framework import status
from rest_framework.test import APIClient

from trcustoms.conftest import UserFactory

VALID_PASSWORD = "Test123!"


@pytest.mark.django_db
def test_user_profile_requires_access(api_client: APIClient) -> None:
    """Test that information about the currently logged in user is not
    available to unauthenticated users.
    """
    response = api_client.get("/api/users/me/")
    data = response.json()
    assert response.status_code == status.HTTP_401_UNAUTHORIZED, data


@pytest.mark.django_db
def test_user_profile(auth_api_client: APIClient) -> None:
    """Test that information about the currently logged in user is available to
    authenticated users.
    """
    response = auth_api_client.get("/api/users/me/")
    data = response.json()
    assert response.status_code == status.HTTP_200_OK, data
    assert "username" in data


@pytest.mark.django_db
def test_login_success(
    api_client: APIClient,
    user_factory: UserFactory,
) -> None:
    """Test that the token endpoint returns a valid JWT token."""
    user = user_factory(username="JohnDoe")
    user.set_password(VALID_PASSWORD)
    user.save()
    response = api_client.post(
        "/api/auth/token/",
        data={
            "username": user.username,
            "password": VALID_PASSWORD,
        },
    )
    data = response.json()
    assert response.status_code == status.HTTP_200_OK, data
    assert "refresh" in data


@pytest.mark.django_db
def test_login_success_case_insensitive(
    api_client: APIClient,
    user_factory: UserFactory,
) -> None:
    """Test that users can log in with any capitalization."""
    user = user_factory(username="JohnDoe")
    user.set_password(VALID_PASSWORD)
    user.save()
    response = api_client.post(
        "/api/auth/token/",
        data={
            "username": user.username.lower(),
            "password": VALID_PASSWORD,
        },
    )
    data = response.json()
    assert response.status_code == status.HTTP_200_OK, data
    assert "refresh" in data
