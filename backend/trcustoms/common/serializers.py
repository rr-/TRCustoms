from django.db import models
from rest_framework import serializers

from trcustoms.common.fields import CustomCharField
from trcustoms.common.models import Country, RatingClass

serializers.ModelSerializer.serializer_field_mapping.update(
    {
        models.CharField: CustomCharField,
        models.TextField: CustomCharField,
    }
)


class CountryListingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Country
        fields = ["code", "name"]


class CountryNestedSerializer(CountryListingSerializer):
    pass


class RatingClassNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = RatingClass
        fields = ["id", "name", "position"]
