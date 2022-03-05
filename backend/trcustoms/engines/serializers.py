from rest_framework import serializers

from trcustoms.engines.models import Engine


class EngineNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Engine
        fields = ["id", "name"]


class EngineListingSerializer(serializers.ModelSerializer):
    level_count = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Engine
        fields = [
            "id",
            "name",
            "level_count",
            "created",
            "last_updated",
        ]

    def get_level_count(self, instance: Engine) -> int:
        return instance.level_count
