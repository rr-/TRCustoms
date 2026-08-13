from typing import Any

from django.contrib.auth.models import AnonymousUser
from django.db.models import Count, Exists, F, OuterRef, QuerySet

from trcustoms.levels.models import Level
from trcustoms.playlists.consts import PlaylistStatus
from trcustoms.playlists.models import PlaylistItem
from trcustoms.ratings.models import Rating
from trcustoms.reviews.models import Review
from trcustoms.users.models import User
from trcustoms.utils import parse_bool, parse_date_range, parse_int, parse_ints
from trcustoms.walkthroughs.consts import WalkthroughStatus, WalkthroughType

MAX_FILTER_IDS = 100


class LevelFilter:
    def __init__(
        self,
        query_params: Any,
        user: User | AnonymousUser | None = None,
    ) -> None:
        self.qp = query_params
        self.user = user

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
            "authors": "authors",
            "tags": "tags",
            "genres": "genres",
        }
        for query_param, field in and_map.items():
            pks = set(
                parse_ints(self.qp.get(query_param), limit=MAX_FILTER_IDS)
            )
            if not pks:
                continue
            alias = f"matched_{field}_count"
            qs = (
                qs.filter(**{f"{field}__pk__in": pks})
                .annotate(**{alias: Count(field, distinct=True)})
                .filter(**{alias: len(pks)})
            )
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


class PlaylistStatusLevelFilter(LevelFilter):
    def run(self, qs: QuerySet[Level]) -> QuerySet[Level]:
        if not self.user or self.user.is_anonymous:
            return qs

        user_id = self.user.pk

        finished_levels = self.qp.get("finished_levels")
        if finished_levels == "hide":
            finished_playlist_item_exists = PlaylistItem.objects.filter(
                user_id=user_id,
                level_id=OuterRef("pk"),
                status=PlaylistStatus.FINISHED,
            )
            qs = qs.annotate(
                finished_playlist_item_exists=Exists(
                    finished_playlist_item_exists
                )
            ).filter(finished_playlist_item_exists=False)
        elif finished_levels == "unrated":
            finished_playlist_item_exists = PlaylistItem.objects.filter(
                user_id=user_id,
                level_id=OuterRef("pk"),
                status=PlaylistStatus.FINISHED,
            )
            user_rating_exists = Rating.objects.filter(
                author_id=user_id,
                level_id=OuterRef("pk"),
            )
            qs = (
                qs.annotate(
                    finished_playlist_item_exists=Exists(
                        finished_playlist_item_exists
                    ),
                    user_rating_exists=Exists(user_rating_exists),
                )
                .filter(
                    finished_playlist_item_exists=True,
                    user_rating_exists=False,
                )
                .exclude(
                    authors__pk=user_id,
                )
            )
        elif finished_levels == "unreviewed":
            finished_playlist_item_exists = PlaylistItem.objects.filter(
                user_id=user_id,
                level_id=OuterRef("pk"),
                status=PlaylistStatus.FINISHED,
            )
            user_review_exists = Review.objects.filter(
                author_id=user_id,
                level_id=OuterRef("pk"),
            )
            qs = (
                qs.annotate(
                    finished_playlist_item_exists=Exists(
                        finished_playlist_item_exists
                    ),
                    user_review_exists=Exists(user_review_exists),
                )
                .filter(
                    finished_playlist_item_exists=True,
                    user_review_exists=False,
                )
                .exclude(
                    authors__pk=user_id,
                )
            )

        dropped_levels = self.qp.get("dropped_levels")
        if dropped_levels == "hide":
            dropped_playlist_item_exists = PlaylistItem.objects.filter(
                user_id=user_id,
                level_id=OuterRef("pk"),
                status=PlaylistStatus.DROPPED,
            )
            qs = qs.annotate(
                dropped_playlist_item_exists=Exists(
                    dropped_playlist_item_exists
                )
            ).filter(dropped_playlist_item_exists=False)

        return qs


def filter_levels_queryset(
    qs: QuerySet[Level],
    query_params: Any,
    user: User | AnonymousUser | None = None,
) -> QuerySet[Level]:
    for filter_cls in LevelFilter.__subclasses__():
        filter_instance = filter_cls(query_params, user)
        qs = filter_instance.run(qs)
    return qs
