from rest_framework import serializers

from trcustoms import snapshots
from trcustoms.models import LevelTag


class LevelTagNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = LevelTag
        fields = ["id", "name"]


class LevelTagListingSerializer(serializers.ModelSerializer):
    level_count = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = LevelTag
        fields = ["id", "name", "level_count", "created", "last_updated"]

    def get_level_count(self, instance: LevelTag) -> int:
        return instance.level_count


class LevelTagDetailsSerializer(LevelTagListingSerializer):
    class Meta:
        model = LevelTag
        fields = ["id", "name", "created", "last_updated"]


@snapshots.register
class LevelTagSnapshotSerializer(LevelTagDetailsSerializer):
    pass
