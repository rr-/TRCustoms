from rest_framework import serializers

from trcustoms.news.models import News


class NewsListingSerializer(serializers.ModelSerializer):
    class Meta:
        model = News
        fields = [
            "id",
            "subject",
            "text",
            "created",
            "last_updated",
        ]


class NewsDetailsSerializer(NewsListingSerializer):
    pass
