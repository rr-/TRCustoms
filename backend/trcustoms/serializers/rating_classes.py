from rest_framework import serializers

from trcustoms.models import RatingClass


class RatingClassNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = RatingClass
        fields = ["id", "name", "position"]
