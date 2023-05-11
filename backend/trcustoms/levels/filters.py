from django.db.models import F, QuerySet

from trcustoms.levels.models import Level
from trcustoms.utils import parse_bool, parse_date_range, parse_int, parse_ints
from trcustoms.walkthroughs.consts import WalkthroughStatus, WalkthroughType


class LevelFilter:
    def __init__(self, query_params) -> None:
        self.qp = query_params

    def run(self, qs: QuerySet[Level]) -> QuerySet[Level]:
        raise NotImplementedError("not implemented")


class SortLevelFilter(LevelFilter):
    def run(self, qs: QuerySet[Level]) -> QuerySet[Level]:
        if not (value := self.qp.get("sort")):
            return qs

        match value:
            case (
                "name"
                | "-name"
                | "created"
                | "-created"
                | "last_updated"
                | "-last_updated"
                | "review_count"
                | "-review_count"
                | "download_count"
                | "-download_count"
            ):
                qs = qs.order_by(value)

            case "engine":
                qs = qs.order_by("engine__name")
            case "-engine":
                qs = qs.order_by("-engine__name")

            case "rating":
                qs = qs.with_rating_values().order_by(F("rating_value").asc())
            case "-rating":
                qs = qs.with_rating_values().order_by(F("rating_value").desc())

            case "size":
                qs = qs.order_by(
                    F("last_file__file__size").asc(nulls_last=True)
                )
            case "-size":
                qs = qs.order_by(
                    F("last_file__file__size").desc(nulls_last=True)
                )

        return qs


class AdditiveLevelFilter(LevelFilter):
    def run(self, qs: QuerySet[Level]) -> QuerySet[Level]:
        and_map = {
            "authors": "authors__pk",
            "tags": "tags__pk",
            "genres": "genres__pk",
        }
        for query_param, qs_key in and_map.items():
            if pks := parse_ints(self.qp.get(query_param)):
                for pk in pks:
                    qs = qs.filter(**{qs_key: pk})
        return qs


class AlternativeLevelFilter(LevelFilter):
    def run(self, qs: QuerySet[Level]) -> QuerySet[Level]:
        or_map = {
            "engines": "engine__pk",
            "difficulties": "difficulty__pk",
            "durations": "duration__pk",
            "ratings": "rating_class__pk",
        }
        for query_param, qs_key in or_map.items():
            if pks := parse_ints(self.qp.get(query_param)):
                qs = qs.filter(**{f"{qs_key}__in": pks})
        return qs


class DatesLevelFilter(LevelFilter):
    def run(self, qs: QuerySet[Level]) -> QuerySet[Level]:
        if value := parse_date_range(self.qp.get("date")):
            min_date, max_date = value
            if min_date:
                qs = qs.filter(created__gte=min_date)
            if max_date:
                qs = qs.filter(created__lt=max_date)
        return qs


class ApprovalLevelFilter(LevelFilter):
    def run(self, qs: QuerySet[Level]) -> QuerySet[Level]:
        if (value := parse_bool(self.qp.get("is_approved"))) is not None:
            qs = qs.filter(is_approved=value)
        return qs


class WalkthroughsLevelFilter(LevelFilter):
    def run(self, qs: QuerySet[Level]) -> QuerySet[Level]:
        if (value := parse_bool(self.qp.get("text_walkthroughs"))) is not None:
            if value:
                qs = qs.filter(
                    walkthroughs__walkthrough_type=WalkthroughType.TEXT,
                    walkthroughs__status=WalkthroughStatus.APPROVED,
                )
            else:
                qs = qs.exclude(
                    walkthroughs__walkthrough_type=WalkthroughType.TEXT,
                    walkthroughs__status=WalkthroughStatus.APPROVED,
                )

        if (
            value := parse_bool(self.qp.get("video_walkthroughs"))
        ) is not None:
            if value:
                qs = qs.filter(
                    walkthroughs__walkthrough_type=WalkthroughType.LINK,
                    walkthroughs__status=WalkthroughStatus.APPROVED,
                )
            else:
                qs = qs.exclude(
                    walkthroughs__walkthrough_type=WalkthroughType.LINK,
                    walkthroughs__status=WalkthroughStatus.APPROVED,
                )

        return qs


class ReviewsLevelFilter(LevelFilter):
    def run(self, qs: QuerySet[Level]) -> QuerySet[Level]:
        if (reviews_max := parse_int(self.qp.get("reviews_max"))) is not None:
            qs = qs.filter(review_count__lte=reviews_max)
        return qs


def filter_levels_queryset(
    qs: QuerySet[Level], query_params
) -> QuerySet[Level]:
    for filter_cls in LevelFilter.__subclasses__():
        filter_instance = filter_cls(query_params)
        qs = filter_instance.run(qs)
    return qs
