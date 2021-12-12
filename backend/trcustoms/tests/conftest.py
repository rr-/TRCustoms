from datetime import datetime
from typing import Any

import dateutil.parser
import factory
import pytest
from mimesis import Generic
from pytest_factoryboy import register
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from trcustoms.models import User


@register
class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User

    username = "john_doe"
    email = "jdoe@example.com"
    password = factory.PostGenerationMethodCall("set_password", "1234")
    source = "trcustoms"


@pytest.fixture(name="fake", scope="session")
def fixture_fake() -> Generic:
    return Generic()


@pytest.fixture(name="api_client")
def fixture_api_client() -> APIClient:
    return APIClient()


@pytest.fixture(name="auth_api_client")
def fixture_auth_api_client(
    user_factory: UserFactory, api_client: APIClient
) -> APIClient:
    user = user_factory()
    refresh_token = RefreshToken.for_user(user)
    access_token = refresh_token.access_token
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
    api_client.user = user
    return api_client


@pytest.fixture(name="any_integer")
def fixture_any_integer() -> object:
    class AnyInteger:
        def __eq__(self, other):
            return isinstance(other, int)

    return AnyInteger


@pytest.fixture(name="any_datetime")
def fixture_any_datetime() -> object:
    class AnyDatetime:
        def __init__(self, allow_strings: bool) -> None:
            self.allow_strings = allow_strings

        def __eq__(self, other: Any) -> bool:
            if self.allow_strings:
                try:
                    dateutil.parser.parse(other)
                    return True
                except ValueError:
                    return False
            return isinstance(other, datetime)

    return AnyDatetime
