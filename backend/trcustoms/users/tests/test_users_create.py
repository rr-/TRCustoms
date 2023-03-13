from datetime import datetime

import pytest
from mimesis import Generic
from rest_framework import status
from rest_framework.test import APIClient

from trcustoms.audit_logs.models import AuditLog
from trcustoms.conftest import UserFactory
from trcustoms.users.models import User

VALID_PASSWORD = "Test123!"


@pytest.mark.django_db
def test_user_creation_missing_fields(api_client: APIClient) -> None:
    """Test that user creation refuses to create a user if the mandatory fields
    are missing.
    """
    response = api_client.post("/api/users/", data={})
    data = response.json()

    assert response.status_code == status.HTTP_400_BAD_REQUEST, data
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

    assert response.status_code == status.HTTP_400_BAD_REQUEST, data
    assert data == {"password": [expected_message]}


@pytest.mark.django_db
def test_user_creation(
    any_integer, any_datetime, api_client: APIClient, fake: Generic
) -> None:
    """Test that user creation works and is publicly available."""
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

    assert response.status_code == status.HTTP_201_CREATED, data
    assert data == {
        "id": any_integer(),
        "email": "",
        "username": payload["username"],
        "first_name": payload["first_name"],
        "last_name": payload["last_name"],
        "is_active": False,
        "is_pending_activation": True,
        "is_banned": False,
        "bio": payload["bio"],
        "date_joined": any_datetime(allow_strings=True),
        "last_login": None,
        "authored_level_count": 0,
        "authored_walkthrough_count": 0,
        "reviewed_level_count": 0,
        "picture": None,
        "country": None,
        "website_url": None,
        "donation_url": None,
        "permissions": [
            "list_users",
            "post_walkthroughs",
            "review_levels",
            "upload_levels",
            "view_users",
        ],
        "trle_author_id": None,
        "trle_reviewer_id": None,
        "is_staff": False,
        "is_superuser": False,
        "awards": [],
    }

    user = User.objects.get(id=data["id"])
    assert user.check_password(VALID_PASSWORD)
    assert user.source == User.Source.trcustoms

    # create a log only after confirming the account
    assert AuditLog.objects.count() == 0


@pytest.mark.django_db
def test_user_creation_duplicate_username_active_user(
    user_factory: UserFactory, api_client: APIClient, fake: Generic
) -> None:
    """Test that user creation prevents from creating a user with a duplicate
    username.
    """
    user = user_factory()
    payload = {
        "email": fake.person.email(),
        "username": user.username,
        "password": VALID_PASSWORD,
    }
    response = api_client.post("/api/users/", data=payload)
    data = response.json()

    assert response.status_code == status.HTTP_400_BAD_REQUEST, data
    assert data == {"username": ["Another account exists with this name."]}


@pytest.mark.django_db
def test_user_creation_duplicate_username_inactive_user(
    user_factory: UserFactory, api_client: APIClient, fake: Generic
) -> None:
    """Test that user creation prevents from creating a user with a duplicate
    username.
    """
    user = user_factory(is_active=False)
    payload = {
        "email": fake.person.email(),
        "username": user.username,
        "password": VALID_PASSWORD,
    }
    response = api_client.post("/api/users/", data=payload)
    data = response.json()

    assert response.status_code == status.HTTP_400_BAD_REQUEST, data
    assert data == {
        "username": [
            "An account with this name is currently awaiting activation."
        ]
    }


@pytest.mark.django_db
def test_user_creation_duplicate_username_case_sensitivity(
    user_factory: UserFactory, api_client: APIClient, fake: Generic
) -> None:
    """Test that user creation prevents from creating a user with a duplicate
    username even if its case does not match.
    """
    user = user_factory(username="JohnDoe")
    payload = {
        "email": fake.person.email(),
        "username": user.username.lower(),
        "password": VALID_PASSWORD,
    }
    response = api_client.post("/api/users/", data=payload)
    data = response.json()

    assert response.status_code == status.HTTP_400_BAD_REQUEST, data
    assert data == {"username": ["Another account exists with this name."]}


@pytest.mark.django_db
def test_user_creation_duplicate_email_active_user(
    user_factory: UserFactory, api_client: APIClient, fake: Generic
) -> None:
    """Test that user creation prevents from creating a user with a duplicate
    email.
    """
    user = user_factory()
    payload = {
        "email": user.email,
        "username": fake.person.username(),
        "password": VALID_PASSWORD,
    }
    response = api_client.post("/api/users/", data=payload)
    data = response.json()

    assert response.status_code == status.HTTP_400_BAD_REQUEST, data
    assert data == {"email": ["Another account exists with this email."]}


@pytest.mark.django_db
def test_user_creation_duplicate_email_inactive_user(
    user_factory: UserFactory, api_client: APIClient, fake: Generic
) -> None:
    """Test that user creation prevents from creating a user with a duplicate
    email.
    """
    user = user_factory(is_active=False)
    payload = {
        "email": user.email,
        "username": fake.person.username(),
        "password": VALID_PASSWORD,
    }
    response = api_client.post("/api/users/", data=payload)
    data = response.json()

    assert response.status_code == status.HTTP_400_BAD_REQUEST, data
    assert data == {
        "email": [
            "An account with this email is currently awaiting activation."
        ]
    }


@pytest.mark.django_db
def test_user_creation_duplicate_email_case_sensitivity(
    user_factory: UserFactory, api_client: APIClient, fake: Generic
) -> None:
    """Test that user creation prevents from creating a user with a duplicate
    email even if its case does not match.
    """
    user = user_factory(email="JOHNDOE@EXAMPLE.COM")
    payload = {
        "email": user.email.lower(),
        "username": fake.person.username(),
        "password": VALID_PASSWORD,
    }
    response = api_client.post("/api/users/", data=payload)
    data = response.json()

    assert response.status_code == status.HTTP_400_BAD_REQUEST, data
    assert data == {"email": ["Another account exists with this email."]}


@pytest.mark.django_db
def test_user_creation_acquiring_trle_account(
    any_integer,
    any_datetime,
    user_factory: UserFactory,
    api_client: APIClient,
    fake: Generic,
) -> None:
    """Test that it is possible to register a TRCustoms user over a legacy TRLE
    account.
    """
    user = user_factory(source=User.Source.trle, is_active=False)
    user.date_joined = datetime(1990, 1, 1)
    user.set_unusable_password()
    user.save()
    payload = {
        "email": fake.person.email(),
        "username": user.username,
        "password": VALID_PASSWORD,
    }
    response = api_client.post("/api/users/", data=payload)
    data = response.json()

    assert response.status_code == status.HTTP_201_CREATED, data
    assert data == {
        "id": any_integer(),
        "email": "",
        "username": payload["username"],
        "first_name": "",
        "last_name": "",
        "is_active": False,
        "is_pending_activation": True,
        "is_banned": False,
        "bio": "",
        "date_joined": any_datetime(allow_strings=True),
        "last_login": None,
        "authored_level_count": 0,
        "authored_walkthrough_count": 0,
        "reviewed_level_count": 0,
        "picture": None,
        "country": None,
        "website_url": None,
        "donation_url": None,
        "permissions": [
            "list_users",
            "post_walkthroughs",
            "review_levels",
            "upload_levels",
            "view_users",
        ],
        "trle_author_id": None,
        "trle_reviewer_id": None,
        "is_staff": False,
        "is_superuser": False,
        "awards": [],
    }

    user.refresh_from_db()
    assert user.email == payload["email"]
    assert user.source == User.Source.trle
    assert user.date_joined != datetime(1990, 1, 1)


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
        "password": VALID_PASSWORD,
        "is_active": True,
        "is_pending_activation": False,
        "is_staff": True,
    }
    response = api_client.post("/api/users/", data=payload)
    data = response.json()

    assert response.status_code == status.HTTP_201_CREATED, data

    user = User.objects.get(id=data["id"])
    assert not data["is_active"]
    assert not user.is_staff
    assert not user.is_active
    assert user.is_pending_activation
