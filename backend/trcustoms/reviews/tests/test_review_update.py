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


@pytest.mark.django_db
def test_review_update_success(
    any_object,
    any_integer,
    any_datetime,
    user_factory: UserFactory,
    level_factory: LevelFactory,
    review_factory: ReviewFactory,
    review_template_question_factory: ReviewTemplateQuestionFactory,
    review_template_answer_factory: ReviewTemplateAnswerFactory,
    auth_api_client: APIClient,
) -> None:
    level = level_factory(authors=[user_factory(username="example")])
    review = review_factory(level=level, author=auth_api_client.user)

    questions = [
        review_template_question_factory(),
        review_template_question_factory(),
    ]
    answers = [
        review_template_answer_factory(question=questions[0]),
        review_template_answer_factory(question=questions[0]),
        review_template_answer_factory(question=questions[1]),
    ]

    response = auth_api_client.patch(
        f"/api/reviews/{review.id}/",
        format="json",
        data={
            "level_id": level.id,
            "text": "test",
            "answer_ids": [answers[0].id, answers[2].id],
        },
    )
    data = response.json()

    assert response.status_code == status.HTTP_200_OK, data
    assert data == {
        "id": any_integer(),
        "created": any_datetime(allow_strings=True),
        "last_updated": any_datetime(allow_strings=True),
        "level": {"id": level.id, "name": level.name, "cover": any_object()},
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
    assert mail.outbox[0].subject == "[TRCustoms] Review edited"


@pytest.mark.django_db
def test_review_update_rating_classes(
    any_integer,
    any_datetime,
    review_rating_classes: QuerySet,
    user_factory: UserFactory,
    level_factory: LevelFactory,
    review_factory: ReviewFactory,
    review_template_question_factory: ReviewTemplateQuestionFactory,
    review_template_answer_factory: ReviewTemplateAnswerFactory,
    auth_api_client: APIClient,
) -> None:
    level = level_factory(authors=[user_factory(username="example")])
    review = review_factory(level=level, author=auth_api_client.user)

    question = review_template_question_factory()
    answers = [
        review_template_answer_factory(question=question, points=0),
        review_template_answer_factory(question=question, points=10),
    ]
    review.answers.set([answers[0]])

    assert review.rating_class.name == "Negative"

    auth_api_client.patch(
        f"/api/reviews/{review.id}/",
        format="json",
        data={
            "level_id": level.id,
            "text": "test",
            "answer_ids": [answers[1].id],
        },
    )

    review.refresh_from_db()
    assert review.rating_class.name == "Positive"


@pytest.mark.django_db
def test_review_update_updates_level_review_count(
    auth_api_client: APIClient,
) -> None:
    level1 = LevelFactory()
    level2 = LevelFactory()
    review = ReviewFactory(level=level1, author=auth_api_client.user)

    response = auth_api_client.patch(
        f"/api/reviews/{review.id}/",
        format="json",
        data={
            "level_id": level2.id,
            "text": "test",
            "answer_ids": [],
        },
    )
    data = response.json()
    level1.refresh_from_db()
    level2.refresh_from_db()
    review.refresh_from_db()

    assert response.status_code == status.HTTP_200_OK, data
    assert review.level == level2
    assert level1.reviews.count() == 0  # pylint: disable=no-member
    assert level1.review_count == 0
    assert level2.reviews.count() == 1  # pylint: disable=no-member
    assert level2.review_count == 1
