from functools import cache
from statistics import mean

from django.db.models import F, Max, Sum

from trcustoms.ratings.consts import RatingType
from trcustoms.ratings.models import Rating, RatingTemplateQuestion


@cache
def get_max_rating_score() -> int:
    return RatingTemplateQuestion.objects.annotate(
        value=Max(F("answers__points")) * F("weight")
    ).aggregate(Sum("value"))["value__sum"]


def get_rating_score(rating: Rating) -> float:
    if rating.rating_type == RatingType.TRLE:
        return (
            mean(
                [
                    rating.trle_score_gameplay or 0,
                    rating.trle_score_enemies or 0,
                    rating.trle_score_atmosphere or 0,
                    rating.trle_score_lighting or 0,
                ]
            )
            / 10.0
        )

    if rating.rating_type == RatingType.TRC:
        max_score = get_max_rating_score()
        if not max_score:
            return 0
        return (
            rating.answers.annotate(
                value=F("points") * F("question__weight")
            ).aggregate(Sum("value"))["value__sum"]
            or 0
        ) / max_score

    assert False, "Invalid rating type"
