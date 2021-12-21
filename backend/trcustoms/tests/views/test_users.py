import pytest
from mimesis import Generic
from rest_framework import status
from rest_framework.test import APIClient

from trcustoms.models import User


@pytest.mark.django_db
def test_user_creation_missing_fields(api_client: APIClient) -> None:
    """Test that user creation refuses to create a user if the mandatory fields
    are missing.
    """
    response = api_client.post("/api/users/", data={})
    data = response.json()

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert data == {
        "username": ["This field is required."],
        "password": ["This field is required."],
        "email": ["This field is required."],
    }


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
def test_user_creation_weak_password(
    api_client: APIClient, fake: Generic, password: str, expected_message: str
) -> None:
    """Test that user creation refuses to create a user if the password is too
    weak.
    """
    payload = {
        "username": fake.person.username(),
        "password": password,
        "email": fake.person.email(),
    }
    response = api_client.post("/api/users/", data=payload)
    data = response.json()

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert data == {"password": [expected_message]}


@pytest.mark.django_db
def test_user_creation(
    any_integer, any_datetime, api_client: APIClient, fake: Generic
) -> None:
    """Test that user creation works and is publicly available."""
    payload = {
        "email": fake.person.email(),
        "username": fake.person.username(),
        "password": "Test123!",
        "first_name": fake.person.first_name(),
        "last_name": fake.person.last_name(),
        "bio": fake.text.sentence(),
    }
    response = api_client.post("/api/users/", data=payload)
    data = response.json()

    assert response.status_code == status.HTTP_201_CREATED
    assert data == {
        "id": any_integer(),
        "email": payload["email"],
        "username": payload["username"],
        "first_name": payload["first_name"],
        "last_name": payload["last_name"],
        "is_active": False,
        "bio": payload["bio"],
        "has_picture": False,
        "date_joined": any_datetime(allow_strings=True),
        "last_login": None,
        "authored_level_count": 0,
    }


@pytest.mark.django_db
def test_user_creation_duplicate_username_active_user(
    user_factory, api_client: APIClient, fake: Generic
) -> None:
    """Test that user creation prevents from creating a user with a duplicate
    username.
    """
    user = user_factory()
    payload = {
        "email": fake.person.email(),
        "username": user.username,
        "password": "Test123!",
    }
    response = api_client.post("/api/users/", data=payload)
    data = response.json()

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert data == {"username": ["Another account exists with this name."]}


@pytest.mark.django_db
def test_user_creation_duplicate_username_inactive_user(
    user_factory, api_client: APIClient, fake: Generic
) -> None:
    """Test that user creation prevents from creating a user with a duplicate
    username.
    """
    user = user_factory(is_active=False)
    payload = {
        "email": fake.person.email(),
        "username": user.username,
        "password": "Test123!",
    }
    response = api_client.post("/api/users/", data=payload)
    data = response.json()

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert data == {
        "username": [
            "An account with this name is currently awaiting activation."
        ]
    }


@pytest.mark.django_db
def test_user_creation_duplicate_email(
    user_factory, api_client: APIClient, fake: Generic
) -> None:
    """Test that user creation prevents from creating a user with a duplicate
    email.
    """
    user = user_factory()
    payload = {
        "email": user.email,
        "username": fake.person.username(),
        "password": "Test123!",
    }
    response = api_client.post("/api/users/", data=payload)
    data = response.json()

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert data == {"email": ["Another account exists with this email."]}


@pytest.mark.django_db
def test_user_creation_duplicate_email_inactive_user(
    user_factory, api_client: APIClient, fake: Generic
) -> None:
    """Test that user creation prevents from creating a user with a duplicate
    email.
    """
    user = user_factory(is_active=False)
    payload = {
        "email": user.email,
        "username": fake.person.username(),
        "password": "Test123!",
    }
    response = api_client.post("/api/users/", data=payload)
    data = response.json()

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert data == {
        "email": [
            "An account with this email is currently awaiting activation."
        ]
    }


@pytest.mark.django_db
def test_user_creation_acquiring_trle_account(
    any_integer,
    any_datetime,
    user_factory,
    api_client: APIClient,
    fake: Generic,
) -> None:
    """Test that it is possible to register a TRCustoms user over a legacy TRLE
    account.
    """
    user = user_factory(source=User.Source.trle, is_active=False)
    payload = {
        "email": fake.person.email(),
        "username": user.username,
        "password": "Test123!",
    }
    response = api_client.post("/api/users/", data=payload)
    data = response.json()

    assert response.status_code == status.HTTP_201_CREATED
    assert data == {
        "id": any_integer(),
        "email": payload["email"],
        "username": payload["username"],
        "first_name": "",
        "last_name": "",
        "is_active": False,
        "bio": "",
        "has_picture": False,
        "date_joined": any_datetime(allow_strings=True),
        "last_login": None,
        "authored_level_count": 0,
    }


@pytest.mark.django_db
def test_user_creation_spoofing_privileges(
    any_integer, any_datetime, api_client: APIClient, fake: Generic
) -> None:
    """Test that the serializer does not look at the user-supplied payload when
    it comes to security information.
    """
    payload = {
        "email": fake.person.email(),
        "username": fake.person.username(),
        "password": "Test123!",
        "is_active": True,
        "is_staff": True,
    }
    response = api_client.post("/api/users/", data=payload)
    data = response.json()

    assert response.status_code == status.HTTP_201_CREATED
    assert not data["is_active"]
    assert not User.objects.get(id=data["id"]).is_staff
    assert not User.objects.get(id=data["id"]).is_active


@pytest.mark.django_db
def test_user_profile_requires_access(api_client: APIClient) -> None:
    """Test that information about the currently logged in user is not
    available to unauthenticated users.
    """
    response = api_client.get("/api/users/me/")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_user_profile(auth_api_client: APIClient) -> None:
    """Test that information about the currently logged in user is available to
    authenticated users.
    """
    response = auth_api_client.get("/api/users/me/")
    data = response.json()
    assert response.status_code == status.HTTP_200_OK
    assert "username" in data
