from django.conf import settings
from django.db.models import Count
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from trcustoms.common.models import Country
from trcustoms.common.serializers import CountryListingSerializer
from trcustoms.engines.models import Engine
from trcustoms.engines.serializers import EngineListingSerializer
from trcustoms.genres.models import Genre
from trcustoms.genres.serializers import GenreListingSerializer
from trcustoms.levels.models import (
    FeaturedLevel,
    Level,
    LevelDifficulty,
    LevelDuration,
)
from trcustoms.levels.serializers import (
    FeaturedLevelListingSerializer,
    LevelDifficultyListingSerializer,
    LevelDurationListingSerializer,
)
from trcustoms.reviews.models import LevelReview, ReviewTemplateQuestion
from trcustoms.reviews.serializers import ReviewTemplateQuestionSerializer
from trcustoms.tags.models import Tag
from trcustoms.tags.serializers import TagListingSerializer


class ConfigViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]

    def list(self, request) -> Response:
        countries = Country.objects.order_by("name")
        level_tags = Tag.objects.with_counts()
        level_genres = Genre.objects.with_counts()
        level_engines = Engine.objects.with_counts()
        level_difficulties = LevelDifficulty.objects.all()
        level_durations = LevelDuration.objects.all()
        review_questions = ReviewTemplateQuestion.objects.all()
        return Response(
            {
                "countries": CountryListingSerializer(
                    countries, many=True
                ).data,
                "tags": TagListingSerializer(level_tags, many=True).data,
                "genres": GenreListingSerializer(level_genres, many=True).data,
                "engines": EngineListingSerializer(
                    level_engines, many=True
                ).data,
                "difficulties": LevelDifficultyListingSerializer(
                    level_difficulties, many=True
                ).data,
                "durations": LevelDurationListingSerializer(
                    level_durations, many=True
                ).data,
                "review_questions": ReviewTemplateQuestionSerializer(
                    review_questions, many=True
                ).data,
                "limits": {
                    "min_genres": settings.MIN_GENRES,
                    "max_genres": settings.MAX_GENRES,
                    "min_tags": settings.MIN_TAGS,
                    "max_tags": settings.MAX_TAGS,
                    "min_screenshots": settings.MIN_SCREENSHOTS,
                    "max_screenshots": settings.MAX_SCREENSHOTS,
                    "min_showcase_links": settings.MIN_SHOWCASE_LINKS,
                    "max_showcase_links": settings.MAX_SHOWCASE_LINKS,
                    "min_authors": settings.MIN_AUTHORS,
                    "max_authors": settings.MAX_AUTHORS,
                    "max_tag_length": settings.MAX_TAG_LENGTH,
                },
                "total_levels": Level.objects.all().count(),
                "total_reviews": LevelReview.objects.all().count(),
                "review_stats": [
                    {
                        "rating_class": {
                            "id": item["rating_class__id"],
                            "position": item["rating_class__position"],
                            "name": item["rating_class__name"],
                        }
                        if item["rating_class__id"]
                        else None,
                        "level_count": item["level_count"],
                    }
                    for item in Level.objects.all()
                    .exclude(rating_class=None)
                    .values(
                        "rating_class__id",
                        "rating_class__position",
                        "rating_class__name",
                    )
                    .annotate(level_count=Count("rating_class"))
                    .order_by("level_count")
                ],
            },
            status.HTTP_200_OK,
        )

    @action(detail=False)
    def featured_levels(self, request) -> Response:
        return Response(
            {
                feature_type.value: FeaturedLevelListingSerializer(
                    FeaturedLevel.objects.filter(feature_type=feature_type)
                    .order_by("-created")
                    .first()
                ).data
                for feature_type in FeaturedLevel.FeatureType
            },
            status.HTTP_200_OK,
        )
