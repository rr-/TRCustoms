import pytest
from django.core import mail
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
    assert mail.outbox[0].subject == "[TRCustoms] Review edited"
