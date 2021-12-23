from rest_framework import serializers

from trcustoms.models import Level, LevelLegacyReview, User


class LevelReviewerSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name"]


class LevelReviewLevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Level
        fields = ["id", "name"]


class LevelLegacyReviewSerializer(serializers.ModelSerializer):
    author = LevelReviewerSerializer(read_only=True)
    level = LevelReviewLevelSerializer(read_only=True)

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
