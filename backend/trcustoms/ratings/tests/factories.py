import factory

from trcustoms.levels.tests.factories import LevelFactory
from trcustoms.ratings.models import (
    Rating,
    RatingTemplateAnswer,
    RatingTemplateQuestion,
)
from trcustoms.users.tests.factories import UserFactory


class RatingTemplateQuestionFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = RatingTemplateQuestion

    position = factory.Sequence(lambda n: n)
    weight = 10
    question_text = factory.Sequence(lambda n: f"Question {n}")


class RatingTemplateAnswerFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = RatingTemplateAnswer

    question = factory.SubFactory(RatingTemplateQuestionFactory)
    position = factory.Sequence(lambda n: n)
    points = 10
    answer_text = factory.Sequence(lambda n: f"Question {n}")


class RatingFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Rating

    author = factory.SubFactory(UserFactory)
    level = factory.SubFactory(LevelFactory)
