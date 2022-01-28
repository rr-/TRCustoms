from functools import cache
from statistics import mean

from django.db.models import F, Max, QuerySet, Sum

from trcustoms.models import (
    Level,
    LevelReview,
    RatingClass,
    ReviewTemplateQuestion,
)


@cache
def get_max_review_score() -> int:
    return ReviewTemplateQuestion.objects.annotate(
        value=Max(F("answers__points")) * F("weight")
    ).aggregate(Sum("value"))["value__sum"]


def get_review_score(review: LevelReview) -> float:
    if review.review_type == LevelReview.ReviewType.TRLE:
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

    if review.review_type == LevelReview.ReviewType.TRC:
        return (
            review.answers.annotate(
                value=F("points") * F("question__weight")
            ).aggregate(Sum("value"))["value__sum"]
            or 0
        ) / get_max_review_score()

    assert False, "Invalid review type"


@cache
def get_rating_classes(target: RatingClass.Target) -> QuerySet:
    return sorted(
        RatingClass.objects.filter(target=target),
        key=lambda rating_class: abs(rating_class.position),
        reverse=True,
    )


@cache
def get_rating_class(
    target: RatingClass.Target, average: float, count: int
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


def get_level_rating_class(level: Level) -> RatingClass:
    ratings = [get_review_score(review) for review in level.reviews.all()]
    if not ratings:
        return None

    average = mean(ratings)
    count = len(ratings)
    return get_rating_class(RatingClass.Target.LEVEL, average, count)


def get_review_rating_class(review: LevelReview) -> RatingClass:
    ratings = [get_review_score(review)]
    if not ratings:
        return None

    average = mean(ratings)
    count = len(ratings)
    return get_rating_class(RatingClass.Target.REVIEW, average, count)
