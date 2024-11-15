from functools import cache
from statistics import mean

from django.db.models import Model, QuerySet

from trcustoms.common.consts import RatingClassSubject
from trcustoms.common.models import RatingClass
from trcustoms.levels.models import Level
from trcustoms.ratings.logic import get_rating_score
from trcustoms.ratings.models import Rating


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
        return [get_rating_score(rating) for rating in instance.ratings.all()]


class RatingScorer(BaseScorer):
    target = RatingClassSubject.RATING
    model = Rating

    @classmethod
    def get_review_scores(cls, instance: Model) -> list[float]:
        return [get_rating_score(instance)]


def get_object_rating_class(instance: Level | Rating) -> RatingClass:
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
