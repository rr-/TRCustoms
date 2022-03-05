import pytest
from rest_framework import status
from rest_framework.test import APIClient

from trcustoms.conftest import UserFactory


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
