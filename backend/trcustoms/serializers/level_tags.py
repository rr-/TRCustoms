from rest_framework import serializers

from trcustoms.models import LevelTag


class LevelTagLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = LevelTag
        fields = ["id", "name"]


class LevelTagFullSerializer(serializers.ModelSerializer):
    level_count = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = LevelTag
        fields = ["id", "name", "level_count", "created", "last_updated"]

    def get_level_count(self, instance: LevelTag) -> int:
        return instance.level_count
