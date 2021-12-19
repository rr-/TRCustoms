from rest_framework import serializers

from trcustoms.models import LevelEngine


class LevelEngineLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = LevelEngine
        fields = ["id", "name"]


class LevelEngineFullSerializer(serializers.ModelSerializer):
    level_count = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = LevelEngine
        fields = ["id", "name", "level_count", "created", "last_updated"]

    def get_level_count(self, instance: LevelEngine) -> int:
        return instance.level_count
