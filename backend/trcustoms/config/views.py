from typing import Any

from django.conf import settings
from django.db.models import Count, Sum
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from trcustoms.common.models import Country
from trcustoms.config.serializers import ConfigSerializer
from trcustoms.engines.models import Engine
from trcustoms.genres.models import Genre
from trcustoms.levels.models import (
    FeaturedLevel,
    Level,
    LevelDifficulty,
    LevelDuration,
)
from trcustoms.levels.serializers import FeaturedLevelListingSerializer
from trcustoms.reviews.models import LevelReview, ReviewTemplateQuestion
from trcustoms.tags.models import Tag
from trcustoms.tasks.update_featured_levels import get_new_release
from trcustoms.walkthroughs.consts import WalkthroughStatus
from trcustoms.walkthroughs.models import Walkthrough


def get_walkthrough_stats() -> dict[str, int]:
    qs = Level.objects.filter(is_approved=True)
    return (
        dict(
            video_and_text=qs.with_both_walkthroughs().count(),
            video=qs.with_video_only_walkthroughs().count(),
            text=qs.with_text_only_walkthroughs().count(),
            none=qs.with_no_walkthroughs().count(),
        ),
    )


def get_review_stats() -> list[dict[str, Any]]:
    qs = (
        Level.objects.all()
        .exclude(rating_class=None)
        .values(
            "rating_class__id",
            "rating_class__position",
            "rating_class__name",
        )
        .annotate(level_count=Count("rating_class"))
        .order_by("level_count")
    )

    return [
        dict(
            rating_class=dict(
                id=item["rating_class__id"],
                position=item["rating_class__position"],
                name=item["rating_class__name"],
            ),
            level_count=item["level_count"],
        )
        for item in qs
    ]


def get_config_data():
    context = dict(
        countries=Country.objects.order_by("name"),
        tags=Tag.objects.with_counts(),
        genres=Genre.objects.with_counts(),
        engines=Engine.objects.with_counts().order_by("position"),
        difficulties=LevelDifficulty.objects.order_by("position"),
        durations=LevelDuration.objects.order_by("position"),
        review_questions=ReviewTemplateQuestion.objects.all(),
        limits=dict(
            min_genres=settings.MIN_GENRES,
            max_genres=settings.MAX_GENRES,
            min_tags=settings.MIN_TAGS,
            max_tags=settings.MAX_TAGS,
            min_screenshots=settings.MIN_SCREENSHOTS,
            max_screenshots=settings.MAX_SCREENSHOTS,
            min_showcase_links=settings.MIN_SHOWCASE_LINKS,
            max_showcase_links=settings.MAX_SHOWCASE_LINKS,
            min_authors=settings.MIN_AUTHORS,
            max_authors=settings.MAX_AUTHORS,
            max_tag_length=settings.MAX_TAG_LENGTH,
        ),
        stats=dict(
            total_levels=Level.objects.filter(is_approved=True).count(),
            total_reviews=LevelReview.objects.all().count(),
            total_walkthroughs=Walkthrough.objects.filter(
                status=WalkthroughStatus.APPROVED,
                level__is_approved=True,
            ).count(),
            total_downloads=(
                Level.objects.all()
                .aggregate(total_download_count=Sum("download_count"))
                .get("total_download_count")
            ),
            walkthroughs=get_walkthrough_stats(),
            reviews=get_review_stats(),
        ),
    )
    return ConfigSerializer(instance=context).data


class ConfigViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]
    serializer_class = ConfigSerializer

    def list(self, request) -> Response:
        return Response(
            get_config_data(),
            status.HTTP_200_OK,
        )

    @action(detail=False)
    def featured_levels(self, request) -> Response:
        result = {
            feature_type.value: FeaturedLevelListingSerializer(
                FeaturedLevel.objects.filter(feature_type=feature_type)
                .order_by("-created")
                .first()
            ).data
            for feature_type in FeaturedLevel.FeatureType
        }

        result[
            FeaturedLevel.FeatureType.NEW_RELEASE.value  # pylint: disable=E1101
        ] = FeaturedLevelListingSerializer(get_new_release()).data

        return Response(
            result,
            status.HTTP_200_OK,
        )
