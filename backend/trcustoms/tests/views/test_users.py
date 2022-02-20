import pytest
from mimesis import Generic
from rest_framework import status
from rest_framework.test import APIClient

from trcustoms.audit_logs.utils import make_audit_log
from trcustoms.models import AuditLog, User
from trcustoms.tests.conftest import UserFactory

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
        "reviewed_level_count": 0,
        "picture": None,
        "country": None,
        "permissions": ["list_users", "review_levels", "upload_levels"],
        "trle_author_id": None,
        "trle_reviewer_id": None,
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
        "reviewed_level_count": 0,
        "picture": None,
        "country": None,
        "permissions": ["list_users", "review_levels", "upload_levels"],
        "trle_author_id": None,
        "trle_reviewer_id": None,
    }

    user.refresh_from_db()
    assert user.email == payload["email"]
    assert user.source == User.Source.trle


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


@pytest.mark.django_db
def test_user_activation(
    admin_api_client: APIClient,
    fake: Generic,
) -> None:
    """Test that ."""
    payload = {
        "email": fake.person.email(),
        "username": fake.person.username(),
        "password": VALID_PASSWORD,
    }
    response = admin_api_client.post("/api/users/", data=payload)
    data = response.json()
    user_id = data["id"]

    assert User.objects.get(username=payload["username"]).is_pending_activation
    assert not User.objects.get(username=payload["username"]).is_active
    assert AuditLog.objects.count() == 1
    assert AuditLog.objects.first().is_action_required

    response = admin_api_client.post(
        f"/api/users/{user_id}/activate/",
        data={"reason": "no reason"},
    )
    data = response.json()
    assert response.status_code == status.HTTP_200_OK, data
    assert data == {}

    assert not User.objects.get(
        username=payload["username"]
    ).is_pending_activation
    assert User.objects.get(username=payload["username"]).is_active
    assert not AuditLog.objects.first().is_action_required


@pytest.mark.django_db
def test_user_rejection(
    admin_api_client: APIClient,
    fake: Generic,
) -> None:
    payload = {
        "email": fake.person.email(),
        "username": fake.person.username(),
        "password": VALID_PASSWORD,
    }
    response = admin_api_client.post("/api/users/", data=payload)
    data = response.json()
    user_id = data["id"]

    assert AuditLog.objects.count() == 1
    assert AuditLog.objects.first().is_action_required

    response = admin_api_client.post(
        f"/api/users/{user_id}/deactivate/",
        data={"reason": "no reason"},
    )
    data = response.json()
    assert response.status_code == status.HTTP_200_OK, data
    assert data == {}

    assert not User.objects.filter(username=payload["username"]).exists()
    assert not AuditLog.objects.first().is_action_required


@pytest.mark.django_db
def test_user_deactivation(
    admin_api_client: APIClient,
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

    response = admin_api_client.post(
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
def test_user_listing_does_not_show_emails(
    auth_api_client: APIClient,
    user_factory: UserFactory,
) -> None:
    user = user_factory(email="jdoe@example.com")

    response = auth_api_client.get("/api/users/")
    data = response.json()
    assert response.status_code == status.HTTP_200_OK, data
    assert len(data["results"]) == 1
    assert "email" not in data["results"][0]
    assert user.email not in response.content.decode()


@pytest.mark.django_db
def test_user_retrieval_does_not_show_emails(
    auth_api_client: APIClient,
    user_factory: UserFactory,
) -> None:
    user = user_factory(
        username="test_hiding_emails", email="jdoe@example.com"
    )

    response = auth_api_client.get(f"/api/users/{user.id}/")
    data = response.json()
    assert user != auth_api_client.user
    assert response.status_code == status.HTTP_200_OK, data
    assert data["email"] == ""
    assert user.email not in response.content.decode()


@pytest.mark.django_db
def test_user_retrieval_show_emails_to_admins(
    admin_api_client: APIClient,
    user_factory: UserFactory,
) -> None:
    user = user_factory(email="jdoe@example.com")

    response = admin_api_client.get(f"/api/users/{user.id}/")
    data = response.json()
    assert response.status_code == status.HTTP_200_OK, data
    assert data["email"] == user.email


@pytest.mark.django_db
def test_user_retrieval_show_emails_to_owners(
    auth_api_client: APIClient,
    user_factory: UserFactory,
) -> None:
    auth_api_client.user.email = "jdoe@example.com"
    auth_api_client.user.save()
    response = auth_api_client.get(f"/api/users/{auth_api_client.user.id}/")
    data = response.json()
    assert response.status_code == status.HTTP_200_OK, data
    assert data["email"] == auth_api_client.user.email
