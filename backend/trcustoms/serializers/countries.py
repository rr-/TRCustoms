from rest_framework import serializers

from trcustoms.models import Country


class CountryListingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Country
        fields = ["code", "name"]


class CountryNestedSerializer(CountryListingSerializer):
    pass
