from rest_framework import serializers

from trcustoms.models import LevelDifficulty


class LevelDifficultyLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = LevelDifficulty
        fields = ["id", "name"]
