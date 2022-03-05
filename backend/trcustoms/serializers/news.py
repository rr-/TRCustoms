from rest_framework import serializers

from trcustoms.models import News, User
from trcustoms.serializers.uploaded_files import UploadedFileNestedSerializer
from trcustoms.serializers.users import UserNestedSerializer


class NewsAuthorSerializer(UserNestedSerializer):
    picture = UploadedFileNestedSerializer(read_only=True)

    class Meta:
        model = UserNestedSerializer.Meta.model
        fields = UserNestedSerializer.Meta.fields + [
            "picture",
        ]


class NewsListingSerializer(serializers.ModelSerializer):
    authors = NewsAuthorSerializer(read_only=True, many=True)
    author_ids = serializers.PrimaryKeyRelatedField(
        write_only=True,
        many=True,
        source="authors",
        queryset=User.objects.all(),
    )

    class Meta:
        model = News
        fields = [
            "id",
            "authors",
            "author_ids",
            "subject",
            "text",
            "created",
            "last_updated",
        ]


class NewsDetailsSerializer(NewsListingSerializer):
    def handle_m2m(self, news_factory, validated_data):
        authors = validated_data.pop("authors", None)

        news = news_factory()

        if authors is not None:
            news.authors.set(authors)

        return news

    def create(self, validated_data):
        func = super().create

        def news_factory():
            return func(validated_data)

        return self.handle_m2m(news_factory, validated_data)

    def update(self, instance, validated_data):
        func = super().update

        def news_factory():
            return func(instance, validated_data)

        return self.handle_m2m(news_factory, validated_data)
