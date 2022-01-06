from rest_framework import serializers

from trcustoms.models import LevelGenre


class LevelGenreLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = LevelGenre
        fields = ["id", "name", "description"]


class LevelGenreFullSerializer(serializers.ModelSerializer):
    level_count = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = LevelGenre
        fields = [
            "id",
            "name",
            "description",
            "level_count",
            "created",
            "last_updated",
        ]

    def get_level_count(self, instance: LevelGenre) -> int:
        return instance.level_count
