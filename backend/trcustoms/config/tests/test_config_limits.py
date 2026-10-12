import pytest
from rest_framework import status
from rest_framework.test import APIClient

from trcustoms.direct_messages.models import Message
from trcustoms.levels.models import Level
from trcustoms.news.models import News
from trcustoms.reviews.models import Review
from trcustoms.users.models import User
from trcustoms.users.tests.factories import UserFactory
from trcustoms.walkthroughs.models import Walkthrough


@pytest.mark.django_db
def test_config_exposes_markdown_field_limits(api_client: APIClient) -> None:
    response = api_client.get("/api/config/")
    data = response.json()

    assert response.status_code == status.HTTP_200_OK, data
    assert data["limits"]["markdown_fields"] == {
        "review_text": Review._meta.get_field("text").max_length,
        "level_description": Level._meta.get_field("description").max_length,
        "user_bio": User._meta.get_field("bio").max_length,
        "news_text": News._meta.get_field("text").max_length,
        "walkthrough_text": Walkthrough._meta.get_field("text").max_length,
        "message_text": Message._meta.get_field("text").max_length,
    }


@pytest.mark.django_db
def test_config_exposes_administrator(api_client: APIClient) -> None:
    administrator = UserFactory(username="Administration")

    data = api_client.get("/api/config/").json()

    assert data["administrator"]["id"] == administrator.id
    assert data["administrator"]["username"] == "Administration"
