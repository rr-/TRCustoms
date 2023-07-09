import tempfile
from datetime import datetime
from typing import Any

import dateutil.parser
import factory
import pytest
from django.db.models import QuerySet
from django.test import override_settings
from mimesis import Generic
from pytest_factoryboy import register
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from trcustoms.awards.models import UserAward
from trcustoms.common.models import RatingClass
from trcustoms.engines.models import Engine
from trcustoms.genres.models import Genre
from trcustoms.levels.models import (
    Level,
    LevelDifficulty,
    LevelDuration,
    LevelScreenshot,
)
from trcustoms.ratings import (
    get_max_review_score,
    get_rating_class,
    get_rating_classes,
)
from trcustoms.reviews.models import (
    LevelReview,
    ReviewTemplateAnswer,
    ReviewTemplateQuestion,
)
from trcustoms.tags.models import Tag
from trcustoms.uploads.models import UploadedFile
from trcustoms.users.models import User
from trcustoms.walkthroughs.models import Walkthrough


@register
class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User
        django_get_or_create = ("username",)

    username = "john_doe"

    email = "jdoe@example.com"
    password = factory.PostGenerationMethodCall("set_password", "1234")
    source = "trcustoms"
    is_email_confirmed = True


@register
class EngineFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Engine

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
        model = Genre

    name = factory.Sequence(lambda n: f"Genre {n}")


@register
class TagFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Tag

    name = factory.Sequence(lambda n: f"Tag {n}")


@register
class UploadedFileFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = UploadedFile


@register
class ScreenshotFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = LevelScreenshot

    file = factory.SubFactory(
        UploadedFileFactory,
        upload_type=UploadedFile.UploadType.LEVEL_SCREENSHOT,
    )
    position = factory.Sequence(lambda n: n)


@register
class LevelFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Level

    is_pending_approval = False
    is_approved = True
    name = factory.Faker("sentence")
    description = factory.Faker("text")
    engine = factory.SubFactory(EngineFactory)
    duration = factory.SubFactory(DurationFactory)
    difficulty = factory.SubFactory(DifficultyFactory)

    @factory.post_generation
    def authors(self, create, extracted, **kwargs):
        # pylint: disable=no-member
        if create and extracted:
            self.authors.set(extracted)

    @factory.post_generation
    def reviews(self, create, extracted, **kwargs):
        # pylint: disable=no-member
        if create and extracted:
            self.reviews.set(extracted)

    @factory.post_generation
    def genres(self, create, extracted, **kwargs):
        # pylint: disable=no-member
        if create and extracted:
            self.genres.set(extracted)


@register
class ReviewTemplateQuestionFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = ReviewTemplateQuestion

    position = factory.Sequence(lambda n: n)
    weight = 10
    question_text = factory.Sequence(lambda n: f"Question {n}")


@register
class ReviewTemplateAnswerFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = ReviewTemplateAnswer

    question = factory.SubFactory(ReviewTemplateQuestionFactory)
    position = factory.Sequence(lambda n: n)
    points = 10
    answer_text = factory.Sequence(lambda n: f"Question {n}")


@register
class ReviewFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = LevelReview

    author = factory.SubFactory(UserFactory)
    level = factory.SubFactory(LevelFactory)


@register
class RatingClassFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = RatingClass
        django_get_or_create = ("position", "target")

    target = RatingClass.Target.REVIEW
    min_rating_count = 0


@register
class WalkthroughFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Walkthrough

    author = factory.SubFactory(UserFactory)
    level = factory.SubFactory(LevelFactory)


@register
class UserAwardFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = UserAward

    user = factory.SubFactory(UserFactory)
    code = factory.Sequence(lambda n: f"code_{n}")
    title = factory.Sequence(lambda n: f"Title {n}")
    description = factory.Sequence(lambda n: f"Description {n}")
    tier = None


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
def fixture_review_rating_classes(
    rating_class_factory: RatingClassFactory,
) -> QuerySet:
    rating_class_factory(
        target=RatingClass.Target.REVIEW,
        position=1,
        min_rating_count=1,
        min_rating_average=None,
        max_rating_average=0.5,
        name="Negative",
    )
    rating_class_factory(
        target=RatingClass.Target.REVIEW,
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
