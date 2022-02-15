from rest_framework import serializers

from trcustoms.models import FeaturedLevel
from trcustoms.serializers.level_genres import LevelGenreNestedSerializer
from trcustoms.serializers.levels import LevelListingSerializer


class FeaturedLevelListingSerializer(serializers.ModelSerializer):
    level = LevelListingSerializer(read_only=True)
    chosen_genre = LevelGenreNestedSerializer(read_only=True)

    class Meta:
        model = FeaturedLevel
        fields = [
            "created",
            "feature_type",
            "level",
            "chosen_genre",
        ]
