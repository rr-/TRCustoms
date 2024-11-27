import pytest
from django.core import mail
from django.db.models import QuerySet
from rest_framework import status
from rest_framework.test import APIClient

from trcustoms.levels.tests.factories import LevelFactory
from trcustoms.ratings.models import Rating
from trcustoms.ratings.tests.factories import (
    RatingFactory,
    RatingTemplateAnswerFactory,
    RatingTemplateQuestionFactory,
)
from trcustoms.users.tests.factories import UserFactory


@pytest.mark.django_db
def test_rating_creation_missing_fields(auth_api_client: APIClient) -> None:
    response = auth_api_client.post("/api/ratings/", json={})
    data = response.json()

    assert response.status_code == status.HTTP_400_BAD_REQUEST, data
    assert data == {
        "level_id": ["This field is required."],
        "answer_ids": ["This field is required."],
    }


@pytest.mark.django_db
def test_rating_creation_success(
    any_object,
    any_integer,
    any_datetime,
    auth_api_client: APIClient,
) -> None:
    level = LevelFactory(authors=[UserFactory(username="example")])

    questions = [
        RatingTemplateQuestionFactory(),
        RatingTemplateQuestionFactory(),
    ]
    answers = [
        RatingTemplateAnswerFactory(question=questions[0]),
        RatingTemplateAnswerFactory(question=questions[0]),
        RatingTemplateAnswerFactory(question=questions[1]),
    ]

    response = auth_api_client.post(
        "/api/ratings/",
        format="json",
        data={
            "level_id": level.id,
            "answer_ids": [answers[0].id, answers[2].id],
        },
    )
    rating = Rating.objects.first()

    assert response.status_code == status.HTTP_201_CREATED, response.content
    assert response.json() == {
        "id": any_integer(),
        "created": any_datetime(allow_strings=True),
        "last_updated": any_datetime(allow_strings=True),
        "last_user_content_updated": any_datetime(
            allow_strings=True, allow_none=True
        ),
        "level": {"id": level.id, "name": level.name, "cover": any_object()},
        "author": {
            "id": auth_api_client.user.id,
            "username": auth_api_client.user.username,
            "first_name": auth_api_client.user.first_name,
            "last_name": auth_api_client.user.last_name,
            "picture": None,
            "rated_level_count": 1,
        },
        "answers": [answers[0].id, answers[2].id],
        "rating_class": None,
        "rating_type": "mo",
    }

    assert rating
    assert rating.last_user_content_updated is None

    assert len(mail.outbox) == 0


@pytest.mark.django_db
def test_rating_creation_rating_classes(
    any_integer,
    any_datetime,
    rating_rating_classes: QuerySet,
    auth_api_client: APIClient,
) -> None:
    level = LevelFactory(authors=[UserFactory(username="example")])

    question = RatingTemplateQuestionFactory()
    answers = [
        RatingTemplateAnswerFactory(question=question, points=0),
        RatingTemplateAnswerFactory(question=question, points=10),
    ]

    response = auth_api_client.post(
        "/api/ratings/",
        format="json",
        data={
            "level_id": level.id,
            "answer_ids": [answers[1].id],
        },
    )
    data = response.json()
    rating = Rating.objects.get(pk=data["id"])

    assert rating.answers.count() == 1
    assert rating.answers.first().points == 10
    assert rating.rating_class is not None
    assert rating.rating_class.name == "Positive"


@pytest.mark.django_db
def test_rating_creation_fails_when_rating_own_level(
    any_integer,
    any_datetime,
    auth_api_client: APIClient,
) -> None:
    level = LevelFactory(authors=[auth_api_client.user])

    response = auth_api_client.post(
        "/api/ratings/",
        format="json",
        data={
            "level_id": level.id,
            "answer_ids": [],
        },
    )
    data = response.json()

    assert response.status_code == status.HTTP_400_BAD_REQUEST, data
    assert data == {"detail": ["Cannot rate own level."]}


@pytest.mark.django_db
def test_rating_creation_fails_if_too_many_answers_for_single_question(
    auth_api_client: APIClient,
) -> None:
    level = LevelFactory()

    questions = [
        RatingTemplateQuestionFactory(),
        RatingTemplateQuestionFactory(),
    ]
    answers = [
        RatingTemplateAnswerFactory(question=questions[0]),
        RatingTemplateAnswerFactory(question=questions[0]),
        RatingTemplateAnswerFactory(question=questions[1]),
    ]

    response = auth_api_client.post(
        "/api/ratings/",
        format="json",
        data={
            "level_id": level.id,
            "answer_ids": [answers[0].id, answers[1].id, answers[2].id],
        },
    )
    data = response.json()

    assert response.status_code == status.HTTP_400_BAD_REQUEST, data
    assert data == {"answer_ids": ["Malformed answers."]}


@pytest.mark.django_db
def test_rating_creation_fails_if_question_has_no_answer(
    auth_api_client: APIClient,
) -> None:
    level = LevelFactory()

    questions = [
        RatingTemplateQuestionFactory(),
        RatingTemplateQuestionFactory(),
    ]
    answers = [
        RatingTemplateAnswerFactory(question=questions[0]),
        RatingTemplateAnswerFactory(question=questions[0]),
        RatingTemplateAnswerFactory(question=questions[1]),
    ]

    response = auth_api_client.post(
        "/api/ratings/",
        format="json",
        data={
            "level_id": level.id,
            "answer_ids": [answers[0].id],
        },
    )
    data = response.json()

    assert response.status_code == status.HTTP_400_BAD_REQUEST, data
    assert data == {"answer_ids": ["Malformed answers."]}


@pytest.mark.django_db
def test_rating_creation_fails_if_already_rated(
    auth_api_client: APIClient,
) -> None:
    level = LevelFactory()
    RatingFactory(level=level, author=auth_api_client.user)

    response = auth_api_client.post(
        "/api/ratings/",
        format="json",
        data={
            "level_id": level.id,
            "answer_ids": [],
        },
    )
    data = response.json()

    assert response.status_code == status.HTTP_400_BAD_REQUEST, data
    assert data == {"detail": ["This user has already rated this level."]}


@pytest.mark.django_db
def test_rating_creation_updates_level_rating_count(
    auth_api_client: APIClient,
) -> None:
    level = LevelFactory()

    response = auth_api_client.post(
        "/api/ratings/",
        format="json",
        data={
            "level_id": level.id,
            "answer_ids": [],
        },
    )
    data = response.json()
    level.refresh_from_db()

    assert response.status_code == status.HTTP_201_CREATED, data
    assert level.ratings.count() == 1  # pylint: disable=no-member
    assert level.rating_count == 1


@pytest.mark.django_db
def test_rating_creation_updates_position(
    auth_api_client: APIClient,
) -> None:
    level = LevelFactory()
    rating1 = RatingFactory(
        level=level, author=UserFactory(username="foo"), position=1
    )
    rating1_last_updated = rating1.last_updated

    response = auth_api_client.post(
        "/api/ratings/",
        format="json",
        data={
            "level_id": level.id,
            "answer_ids": [],
        },
    )
    data = response.json()
    rating1.refresh_from_db()
    rating2 = Rating.objects.get(pk=data["id"])

    assert response.status_code == status.HTTP_201_CREATED, data
    assert rating1.position == 1
    assert rating2.position == 2
    assert rating1.last_updated == rating1_last_updated
