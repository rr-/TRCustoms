import factory

from trcustoms.levels.tests.factories import LevelFactory
from trcustoms.reviews.models import (
    Review,
    ReviewTemplateAnswer,
    ReviewTemplateQuestion,
    ReviewVote,
)
from trcustoms.users.tests.factories import UserFactory


class ReviewTemplateQuestionFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = ReviewTemplateQuestion

    position = factory.Sequence(lambda n: n)
    weight = 10
    question_text = factory.Sequence(lambda n: f"Question {n}")


class ReviewTemplateAnswerFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = ReviewTemplateAnswer

    question = factory.SubFactory(ReviewTemplateQuestionFactory)
    position = factory.Sequence(lambda n: n)
    points = 10
    answer_text = factory.Sequence(lambda n: f"Question {n}")


class ReviewFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Review

    author = factory.SubFactory(
        UserFactory,
        username=factory.Sequence(lambda n: f"review_author_{n}"),
        email=factory.Sequence(lambda n: f"review_author_{n}@example.com"),
    )
    level = factory.SubFactory(LevelFactory)


class ReviewVoteFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = ReviewVote

    review = factory.SubFactory(ReviewFactory)
    user = factory.SubFactory(UserFactory)
    vote = 1
