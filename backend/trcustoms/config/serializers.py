from rest_framework import serializers

from trcustoms.common.serializers import (
    CountryListingSerializer,
    RatingClassNestedSerializer,
)
from trcustoms.engines.serializers import EngineListingSerializer
from trcustoms.genres.serializers import GenreListingSerializer
from trcustoms.levels.serializers import (
    LevelDifficultyListingSerializer,
    LevelDurationListingSerializer,
)
from trcustoms.reviews.serializers import ReviewTemplateQuestionSerializer
from trcustoms.tags.serializers import TagListingSerializer


class GlobalLimitsSerializer(serializers.Serializer):
    min_genres = serializers.IntegerField()
    max_genres = serializers.IntegerField()
    min_tags = serializers.IntegerField()
    max_tags = serializers.IntegerField()
    min_screenshots = serializers.IntegerField()
    max_screenshots = serializers.IntegerField()
    min_showcase_links = serializers.IntegerField()
    max_showcase_links = serializers.IntegerField()
    min_authors = serializers.IntegerField()
    max_authors = serializers.IntegerField()
    max_tag_length = serializers.IntegerField()


class ReviewStatSerializer(serializers.Serializer):
    rating_class = RatingClassNestedSerializer()
    level_count = serializers.IntegerField()


class WalkthroughStatSerializer(serializers.Serializer):
    video_and_text = serializers.IntegerField()
    video = serializers.IntegerField()
    text = serializers.IntegerField()
    none = serializers.IntegerField()


class GlobalStatsSerializer(serializers.Serializer):
    total_levels = serializers.IntegerField()
    total_reviews = serializers.IntegerField()
    total_walkthroughs = serializers.IntegerField()
    total_downloads = serializers.IntegerField()
    reviews = ReviewStatSerializer(many=True)
    walkthroughs = WalkthroughStatSerializer()


class ConfigSerializer(serializers.Serializer):
    countries = CountryListingSerializer(many=True)
    tags = TagListingSerializer(many=True)
    genres = GenreListingSerializer(many=True)
    engines = EngineListingSerializer(many=True)
    difficulties = LevelDifficultyListingSerializer(many=True)
    durations = LevelDurationListingSerializer(many=True)
    review_questions = ReviewTemplateQuestionSerializer(many=True)
    limits = GlobalLimitsSerializer()
    stats = GlobalStatsSerializer()
