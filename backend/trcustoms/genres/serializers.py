from rest_framework import serializers

from trcustoms.genres.models import Genre


class GenreNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ["id", "name"]


class GenreListingSerializer(serializers.ModelSerializer):
    level_count = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Genre
        fields = [
            "id",
            "name",
            "description",
            "level_count",
            "created",
            "last_updated",
        ]

    def get_level_count(self, instance: Genre) -> int:
        return instance.level_count
