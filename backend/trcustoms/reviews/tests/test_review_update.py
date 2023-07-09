import pytest
from django.core import mail
from django.db.models import QuerySet
from rest_framework import status
from rest_framework.test import APIClient

from trcustoms.levels.tests.factories import LevelFactory
from trcustoms.reviews.tests.factories import (
    ReviewFactory,
    ReviewTemplateAnswerFactory,
    ReviewTemplateQuestionFactory,
)
from trcustoms.users.tests.factories import UserFactory


@pytest.mark.django_db
def test_review_update_success(
    any_object,
    any_integer,
    any_datetime,
    auth_api_client: APIClient,
) -> None:
    level = LevelFactory(authors=[UserFactory(username="example")])
    review = ReviewFactory(level=level, author=auth_api_client.user)

    questions = [
        ReviewTemplateQuestionFactory(),
        ReviewTemplateQuestionFactory(),
    ]
    answers = [
        ReviewTemplateAnswerFactory(question=questions[0]),
        ReviewTemplateAnswerFactory(question=questions[0]),
        ReviewTemplateAnswerFactory(question=questions[1]),
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
    auth_api_client: APIClient,
) -> None:
    level = LevelFactory(authors=[UserFactory(username="example")])
    review = ReviewFactory(level=level, author=auth_api_client.user)

    question = ReviewTemplateQuestionFactory()
    answers = [
        ReviewTemplateAnswerFactory(question=question, points=0),
        ReviewTemplateAnswerFactory(question=question, points=10),
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
