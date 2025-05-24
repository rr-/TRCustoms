from rest_framework import serializers

from trcustoms.common.models import Country, RatingClass


class CountryListingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Country
        fields = ["iso_3166_1_alpha2", "name", "iso_3166_1_numeric"]


class CountryNestedSerializer(CountryListingSerializer):
    pass


class RatingClassNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = RatingClass
        fields = ["id", "name", "position"]


class EmptySerializer(serializers.Serializer):
    pass
