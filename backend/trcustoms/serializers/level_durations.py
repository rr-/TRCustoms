from rest_framework import serializers

from trcustoms.models import LevelDuration


class LevelDurationLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = LevelDuration
        fields = ["id", "name"]
