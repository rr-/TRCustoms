from datetime import datetime, timezone
from unittest.mock import patch

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
def test_rating_update_success(
    any_object,
    any_integer,
    any_datetime,
    auth_api_client: APIClient,
) -> None:
    level = LevelFactory(authors=[UserFactory(username="example")])
    rating = RatingFactory(level=level, author=auth_api_client.user)
    rating.created = datetime(2023, 12, 29, tzinfo=timezone.utc)
    rating.save(update_fields=["created"])

    questions = [
        RatingTemplateQuestionFactory(),
        RatingTemplateQuestionFactory(),
    ]
    answers = [
        RatingTemplateAnswerFactory(question=questions[0]),
        RatingTemplateAnswerFactory(question=questions[0]),
        RatingTemplateAnswerFactory(question=questions[1]),
    ]

    with patch(
        "trcustoms.common.models.timezone.now",
        **{"return_value": datetime(2024, 1, 1, tzinfo=timezone.utc)},
    ):
        response = auth_api_client.patch(
            f"/api/ratings/{rating.id}/",
            format="json",
            data={
                "level_id": level.id,
                "answer_ids": [answers[0].id, answers[2].id],
            },
        )

    rating = Rating.objects.first()

    assert response.status_code == status.HTTP_200_OK, response.content
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

    assert rating.last_user_content_updated == datetime(
        2024, 1, 1, tzinfo=timezone.utc
    )

    assert len(mail.outbox) == 0


@pytest.mark.django_db
def test_rating_update_rating_classes(
    any_integer,
    any_datetime,
    rating_rating_classes: QuerySet,
    auth_api_client: APIClient,
) -> None:
    level = LevelFactory(authors=[UserFactory(username="example")])
    rating = RatingFactory(level=level, author=auth_api_client.user)

    question = RatingTemplateQuestionFactory()
    answers = [
        RatingTemplateAnswerFactory(question=question, points=0),
        RatingTemplateAnswerFactory(question=question, points=10),
    ]
    rating.answers.set([answers[0]])

    assert rating.rating_class.name == "Negative"

    auth_api_client.patch(
        f"/api/ratings/{rating.id}/",
        format="json",
        data={
            "level_id": level.id,
            "answer_ids": [answers[1].id],
        },
    )

    rating.refresh_from_db()
    assert rating.rating_class.name == "Positive"


@pytest.mark.django_db
def test_rating_update_updates_level_rating_count(
    auth_api_client: APIClient,
) -> None:
    level1 = LevelFactory()
    level2 = LevelFactory()
    rating = RatingFactory(level=level1, author=auth_api_client.user)

    response = auth_api_client.patch(
        f"/api/ratings/{rating.id}/",
        format="json",
        data={
            "level_id": level2.id,
            "answer_ids": [],
        },
    )
    data = response.json()
    level1.refresh_from_db()
    level2.refresh_from_db()
    rating.refresh_from_db()

    assert response.status_code == status.HTTP_200_OK, data
    assert rating.level == level2
    assert level1.ratings.count() == 0  # pylint: disable=no-member
    assert level1.rating_count == 0
    assert level2.ratings.count() == 1  # pylint: disable=no-member
    assert level2.rating_count == 1
