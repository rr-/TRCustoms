import pytest
from django.core import mail
from django.db.models import QuerySet
from rest_framework import status
from rest_framework.test import APIClient

from trcustoms.conftest import (
    LevelFactory,
    ReviewFactory,
    ReviewTemplateAnswerFactory,
    ReviewTemplateQuestionFactory,
    UserFactory,
)
from trcustoms.reviews.models import LevelReview


@pytest.mark.django_db
def test_review_creation_missing_fields(auth_api_client: APIClient) -> None:
    response = auth_api_client.post("/api/reviews/", json={})
    data = response.json()

    assert response.status_code == status.HTTP_400_BAD_REQUEST, data
    assert data == {
        "level_id": ["This field is required."],
        "text": ["This field is required."],
        "answer_ids": ["This field is required."],
    }


@pytest.mark.django_db
def test_review_creation_success(
    any_integer,
    any_datetime,
    user_factory: UserFactory,
    level_factory: LevelFactory,
    review_template_question_factory: ReviewTemplateQuestionFactory,
    review_template_answer_factory: ReviewTemplateAnswerFactory,
    auth_api_client: APIClient,
) -> None:
    level = level_factory(authors=[user_factory(username="example")])

    questions = [
        review_template_question_factory(),
        review_template_question_factory(),
    ]
    answers = [
        review_template_answer_factory(question=questions[0]),
        review_template_answer_factory(question=questions[0]),
        review_template_answer_factory(question=questions[1]),
    ]

    response = auth_api_client.post(
        "/api/reviews/",
        format="json",
        data={
            "level_id": level.id,
            "text": "test",
            "answer_ids": [answers[0].id, answers[2].id],
        },
    )
    data = response.json()

    assert response.status_code == status.HTTP_201_CREATED, data
    assert data == {
        "id": any_integer(),
        "created": any_datetime(allow_strings=True),
        "last_updated": any_datetime(allow_strings=True),
        "level": {"id": level.id, "name": level.name},
        "author": {
            "id": auth_api_client.user.id,
            "username": auth_api_client.user.username,
            "first_name": auth_api_client.user.first_name,
            "last_name": auth_api_client.user.last_name,
            "picture": None,
            "reviewed_level_count": 1,
        },
        "text": "test",
        "answers": [answers[0].id, answers[2].id],
        "rating_class": None,
    }
    assert len(mail.outbox) == 1
    assert mail.outbox[0].subject == "[TRCustoms] New review"


@pytest.mark.django_db
def test_review_creation_rating_classes(
    any_integer,
    any_datetime,
    review_rating_classes: QuerySet,
    user_factory: UserFactory,
    level_factory: LevelFactory,
    review_template_question_factory: ReviewTemplateQuestionFactory,
    review_template_answer_factory: ReviewTemplateAnswerFactory,
    auth_api_client: APIClient,
) -> None:
    level = level_factory(authors=[user_factory(username="example")])

    question = review_template_question_factory()
    answers = [
        review_template_answer_factory(question=question, points=0),
        review_template_answer_factory(question=question, points=10),
    ]

    response = auth_api_client.post(
        "/api/reviews/",
        format="json",
        data={
            "level_id": level.id,
            "text": "test",
            "answer_ids": [answers[1].id],
        },
    )
    data = response.json()
    review = LevelReview.objects.get(pk=data["id"])

    assert review.answers.count() == 1
    assert review.answers.first().points == 10
    assert review.rating_class is not None
    assert review.rating_class.name == "Positive"


@pytest.mark.django_db
def test_review_creation_fails_when_reviewing_own_level(
    any_integer,
    any_datetime,
    level_factory: LevelFactory,
    review_template_question_factory: ReviewTemplateQuestionFactory,
    review_template_answer_factory: ReviewTemplateAnswerFactory,
    auth_api_client: APIClient,
) -> None:
    level = level_factory(authors=[auth_api_client.user])

    response = auth_api_client.post(
        "/api/reviews/",
        format="json",
        data={
            "level_id": level.id,
            "text": "test",
            "answer_ids": [],
        },
    )
    data = response.json()

    assert response.status_code == status.HTTP_400_BAD_REQUEST, data
    assert data == {"detail": ["Cannot review own level."]}


@pytest.mark.django_db
def test_review_creation_fails_if_too_many_answers_for_single_question(
    level_factory: LevelFactory,
    review_template_question_factory: ReviewTemplateQuestionFactory,
    review_template_answer_factory: ReviewTemplateAnswerFactory,
    auth_api_client: APIClient,
) -> None:
    level = level_factory()

    questions = [
        review_template_question_factory(),
        review_template_question_factory(),
    ]
    answers = [
        review_template_answer_factory(question=questions[0]),
        review_template_answer_factory(question=questions[0]),
        review_template_answer_factory(question=questions[1]),
    ]

    response = auth_api_client.post(
        "/api/reviews/",
        format="json",
        data={
            "level_id": level.id,
            "text": "test",
            "answer_ids": [answers[0].id, answers[1].id, answers[2].id],
        },
    )
    data = response.json()

    assert response.status_code == status.HTTP_400_BAD_REQUEST, data
    assert data == {"answer_ids": ["Malformed answers."]}


@pytest.mark.django_db
def test_review_creation_fails_if_question_has_no_answer(
    level_factory: LevelFactory,
    review_template_question_factory: ReviewTemplateQuestionFactory,
    review_template_answer_factory: ReviewTemplateAnswerFactory,
    auth_api_client: APIClient,
) -> None:
    level = level_factory()

    questions = [
        review_template_question_factory(),
        review_template_question_factory(),
    ]
    answers = [
        review_template_answer_factory(question=questions[0]),
        review_template_answer_factory(question=questions[0]),
        review_template_answer_factory(question=questions[1]),
    ]

    response = auth_api_client.post(
        "/api/reviews/",
        format="json",
        data={
            "level_id": level.id,
            "text": "test",
            "answer_ids": [answers[0].id],
        },
    )
    data = response.json()

    assert response.status_code == status.HTTP_400_BAD_REQUEST, data
    assert data == {"answer_ids": ["Malformed answers."]}


@pytest.mark.django_db
def test_review_creation_fails_if_already_reviewed(
    level_factory: LevelFactory,
    review_factory: ReviewFactory,
    review_template_question_factory: ReviewTemplateQuestionFactory,
    review_template_answer_factory: ReviewTemplateAnswerFactory,
    auth_api_client: APIClient,
) -> None:
    level = level_factory()
    review_factory(level=level, author=auth_api_client.user)

    response = auth_api_client.post(
        "/api/reviews/",
        format="json",
        data={
            "level_id": level.id,
            "text": "test",
            "answer_ids": [],
        },
    )
    data = response.json()

    assert response.status_code == status.HTTP_400_BAD_REQUEST, data
    assert data == {"detail": ["This user has already reviewed this level."]}
