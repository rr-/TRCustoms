from rest_framework import serializers

from trcustoms.models import LevelMedium


class LevelMediumSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = LevelMedium
        fields = ["id", "url"]

    def get_url(self, instance) -> str:
        return instance.file.content.url
