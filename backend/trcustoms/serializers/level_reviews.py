from rest_framework import serializers

from trcustoms import snapshots
from trcustoms.models import LevelLegacyReview
from trcustoms.serializers.levels import LevelNestedSerializer
from trcustoms.serializers.users import UserNestedSerializer


class LevelReviewListingSerializer(serializers.ModelSerializer):
    author = UserNestedSerializer(read_only=True)
    level = LevelNestedSerializer(read_only=True)

    class Meta:
        model = LevelLegacyReview
        fields = [
            "id",
            "author",
            "level",
            "rating_gameplay",
            "rating_enemies",
            "rating_atmosphere",
            "rating_lighting",
            "text",
            "created",
            "last_updated",
        ]


@snapshots.register(name_getter=lambda review: review.level.name)
class LevelReviewSnapshotSerializer(LevelReviewListingSerializer):
    pass
