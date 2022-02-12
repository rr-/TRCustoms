from django.conf import settings
from rest_framework import serializers

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
    def validate_name(self, value):
        if len(value) > settings.MAX_TAG_LENGTH:
            raise serializers.ValidationError(
                "A tag name cannot have more than "
                f"{settings.MAX_TAG_LENGTH} characters."
            )
        if LevelTag.objects.filter(name__iexact=value).exists():
            raise serializers.ValidationError(
                "Another tag exists with this name."
            )
        return value

    class Meta:
        model = LevelTag
        fields = ["id", "name", "created", "last_updated"]
