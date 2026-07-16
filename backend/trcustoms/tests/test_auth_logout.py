import pytest
from rest_framework import status
from rest_framework.test import APIClient

from trcustoms.users.tests.factories import UserFactory

PASSWORD = "Test123!"


@pytest.mark.django_db
def test_logout_blacklists_refresh_token() -> None:
    """Explicit logout must revoke the refresh token server-side."""
    UserFactory(
        username="logout_user",
        password=PASSWORD,
        is_active=True,
        is_email_confirmed=True,
    )
    client = APIClient()

    tokens = client.post(
        "/api/auth/token/",
        data={"username": "logout_user", "password": PASSWORD},
    ).json()
    refresh = tokens["refresh"]

    before = client.post("/api/auth/token/refresh/", data={"refresh": refresh})
    assert before.status_code == status.HTTP_200_OK

    logout = client.post("/api/auth/token/logout/", data={"refresh": refresh})
    assert logout.status_code == status.HTTP_200_OK

    after = client.post("/api/auth/token/refresh/", data={"refresh": refresh})
    assert after.status_code == status.HTTP_401_UNAUTHORIZED
