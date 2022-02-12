from rest_framework import serializers

from trcustoms.models import LevelDuration


class LevelDurationNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = LevelDuration
        fields = ["id", "name"]


class LevelDurationListingSerializer(serializers.ModelSerializer):
    class Meta:
        model = LevelDuration
        fields = ["id", "name", "created", "last_updated"]
