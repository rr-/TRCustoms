from rest_framework import serializers

from trcustoms.models import LevelExternalLink


class LevelExternalLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = LevelExternalLink
        fields = ["id", "position", "url", "link_type"]
