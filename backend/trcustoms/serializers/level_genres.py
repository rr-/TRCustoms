from rest_framework import serializers

from trcustoms import snapshots
from trcustoms.models import LevelGenre


class LevelGenreNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = LevelGenre
        fields = ["id", "name"]


class LevelGenreListingSerializer(serializers.ModelSerializer):
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


@snapshots.register
class LevelGenreSnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = LevelGenre
        fields = [
            "id",
            "name",
            "description",
            "created",
            "last_updated",
        ]
