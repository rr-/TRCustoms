from datetime import datetime
from typing import Any

import dateutil.parser
import factory
import pytest
from mimesis import Generic
from pytest_factoryboy import register
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from trcustoms.models import (
    Level,
    LevelDifficulty,
    LevelDuration,
    LevelEngine,
    LevelGenre,
    LevelTag,
    UploadedFile,
    User,
)


@register
class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User
        django_get_or_create = ("username",)

    username = "john_doe"

    email = "jdoe@example.com"
    password = factory.PostGenerationMethodCall("set_password", "1234")
    source = "trcustoms"


@register
class EngineFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = LevelEngine

    name = factory.Sequence(lambda n: f"Engine {n}")


@register
class DurationFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = LevelDuration

    position = factory.Sequence(lambda n: n)
    name = factory.Sequence(lambda n: f"Duration {n}")


@register
class DifficultyFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = LevelDifficulty

    position = factory.Sequence(lambda n: n)
    name = factory.Sequence(lambda n: f"Difficulty {n}")


@register
class GenreFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = LevelGenre

    name = factory.Sequence(lambda n: f"Genre {n}")


@register
class TagFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = LevelTag

    name = factory.Sequence(lambda n: f"Tag {n}")


@register
class UploadedFileFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = UploadedFile


@register
class LevelFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Level

    name = factory.Faker("sentence")
    description = factory.Faker("text")
    engine = factory.SubFactory(EngineFactory)
    duration = factory.SubFactory(DurationFactory)
    difficulty = factory.SubFactory(DifficultyFactory)


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
