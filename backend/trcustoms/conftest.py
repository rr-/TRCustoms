import tempfile
from datetime import datetime
from typing import Any

import dateutil.parser
import pytest
from django.db.models import QuerySet
from django.test import override_settings
from mimesis import Generic
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from trcustoms.common.consts import RatingClassSubject
from trcustoms.common.models import RatingClass
from trcustoms.common.tests.factories import RatingClassFactory
from trcustoms.ratings import (
    get_max_review_score,
    get_rating_class,
    get_rating_classes,
)
from trcustoms.users.tests.factories import UserFactory


@pytest.fixture(name="fake", scope="session")
def fixture_fake() -> Generic:
    return Generic()


@pytest.fixture(name="api_client")
def fixture_api_client() -> APIClient:
    return APIClient()


@pytest.fixture(name="auth_api_client")
def fixture_auth_api_client(api_client: APIClient) -> APIClient:
    user = UserFactory()
    refresh_token = RefreshToken.for_user(user)
    access_token = refresh_token.access_token
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
    api_client.user = user
    return api_client


@pytest.fixture(name="staff_api_client")
def fixture_staff_api_client(auth_api_client: APIClient) -> APIClient:
    auth_api_client.user.is_staff = True
    auth_api_client.user.save()
    return auth_api_client


@pytest.fixture(name="superuser_api_client")
def fixture_superuser_api_client(auth_api_client: APIClient) -> APIClient:
    auth_api_client.user.is_superuser = True
    auth_api_client.user.save()
    return auth_api_client


@pytest.fixture(name="any_object")
def fixture_any_object() -> object:
    class AnyObject:
        def __eq__(self, other):
            return isinstance(other, object)

    return AnyObject


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


@pytest.fixture(name="review_rating_classes")
def fixture_review_rating_classes() -> QuerySet:
    RatingClassFactory(
        target=RatingClassSubject.REVIEW,
        position=1,
        min_rating_count=1,
        min_rating_average=None,
        max_rating_average=0.5,
        name="Negative",
    )
    RatingClassFactory(
        target=RatingClassSubject.REVIEW,
        position=-1,
        min_rating_count=1,
        min_rating_average=0.5,
        max_rating_average=None,
        name="Positive",
    )
    return RatingClass.objects.all()


@pytest.fixture(name="clear_caches", autouse=True)
def fixture_clear_caches() -> None:
    get_max_review_score.cache_clear()
    get_rating_classes.cache_clear()
    get_rating_class.cache_clear()


@pytest.fixture(name="use_tmp_media_dir", autouse=True, scope="session")
def fixture_use_tmp_media_dir() -> None:
    with override_settings(MEDIA_ROOT=tempfile.gettempdir()):
        yield
