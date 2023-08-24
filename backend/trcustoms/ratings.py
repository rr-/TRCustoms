from functools import cache
from statistics import mean

from django.db.models import F, Max, Model, QuerySet, Sum

from trcustoms.common.consts import RatingClassSubject
from trcustoms.common.models import RatingClass
from trcustoms.levels.models import Level
from trcustoms.reviews.consts import ReviewType
from trcustoms.reviews.models import Review, ReviewTemplateQuestion


@cache
def get_max_review_score() -> int:
    return ReviewTemplateQuestion.objects.annotate(
        value=Max(F("answers__points")) * F("weight")
    ).aggregate(Sum("value"))["value__sum"]


def get_review_score(review: Review) -> float:
    if review.review_type == ReviewType.TRLE:
        return (
            mean(
                [
                    review.trle_rating_gameplay or 0,
                    review.trle_rating_enemies or 0,
                    review.trle_rating_atmosphere or 0,
                    review.trle_rating_lighting or 0,
                ]
            )
            / 10.0
        )

    if review.review_type == ReviewType.TRC:
        max_score = get_max_review_score()
        if not max_score:
            return 0
        return (
            review.answers.annotate(
                value=F("points") * F("question__weight")
            ).aggregate(Sum("value"))["value__sum"]
            or 0
        ) / max_score

    assert False, "Invalid review type"


@cache
def get_rating_classes(target: RatingClassSubject) -> QuerySet:
    return sorted(
        RatingClass.objects.filter(target=target),
        key=lambda rating_class: abs(rating_class.position),
        reverse=True,
    )


@cache
def get_rating_class(
    target: RatingClassSubject, average: float, count: int
) -> RatingClass:
    for rating_class in get_rating_classes(target):
        # pylint: disable=chained-comparison
        if (
            count >= (rating_class.min_rating_count or 0)
            and average >= (rating_class.min_rating_average or float("-inf"))
            and average <= (rating_class.max_rating_average or float("inf"))
        ):
            return rating_class

    return None


class BaseScorer:
    target: RatingClassSubject = NotImplemented
    model: type[Model] = NotImplemented

    @classmethod
    def get_review_scores(cls, instance: Model) -> float:
        raise NotImplementedError("not implemented")


class LevelScorer(BaseScorer):
    target = RatingClassSubject.LEVEL
    model = Level

    @classmethod
    def get_review_scores(cls, instance: Model) -> list[float]:
        return [get_review_score(review) for review in instance.reviews.all()]


class ReviewScorer(BaseScorer):
    target = RatingClassSubject.REVIEW
    model = Review

    @classmethod
    def get_review_scores(cls, instance: Model) -> list[float]:
        return [get_review_score(instance)]


def get_object_rating_class(instance: Level | Review) -> RatingClass:
    for scorer in BaseScorer.__subclasses__():
        if isinstance(instance, scorer.model):
            ratings = scorer.get_review_scores(instance)
            target = scorer.target
            break
    else:
        assert False, "Invalid instance"

    if not ratings:
        return None

    average = mean(ratings)
    count = len(ratings)
    return get_rating_class(target, average, count)
