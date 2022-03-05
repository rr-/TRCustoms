from django.conf import settings
from rest_framework import serializers

from trcustoms.tags.models import Tag


class TagNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ["id", "name"]


class TagListingSerializer(serializers.ModelSerializer):
    level_count = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Tag
        fields = ["id", "name", "level_count", "created", "last_updated"]

    def get_level_count(self, instance: Tag) -> int:
        return instance.level_count


class TagDetailsSerializer(TagListingSerializer):
    def validate_name(self, value):
        if len(value) > settings.MAX_TAG_LENGTH:
            raise serializers.ValidationError(
                "A tag name cannot have more than "
                f"{settings.MAX_TAG_LENGTH} characters."
            )
        if (
            Tag.objects.filter(name__iexact=value)
            .exclude(id=self.instance.id if self.instance else None)
            .exists()
        ):
            raise serializers.ValidationError(
                "Another tag exists with this name."
            )
        return value

    class Meta:
        model = Tag
        fields = ["id", "name", "created", "last_updated"]
