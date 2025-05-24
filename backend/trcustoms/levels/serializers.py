from typing import Any

from django.conf import settings
from django.core.validators import MaxLengthValidator
from rest_framework import serializers

from trcustoms.common.fields import CustomCharField
from trcustoms.common.serializers import RatingClassNestedSerializer
from trcustoms.engines.models import Engine
from trcustoms.engines.serializers import EngineNestedSerializer
from trcustoms.genres.models import Genre
from trcustoms.genres.serializers import GenreNestedSerializer
from trcustoms.levels.models import (
    FeaturedLevel,
    Level,
    LevelDifficulty,
    LevelDuration,
    LevelExternalLink,
    LevelFile,
    LevelScreenshot,
)
from trcustoms.mails import send_level_submitted_mail
from trcustoms.tags.models import Tag
from trcustoms.tags.serializers import TagNestedSerializer
from trcustoms.tasks import update_awards
from trcustoms.uploads.consts import UploadType
from trcustoms.uploads.models import UploadedFile
from trcustoms.uploads.serializers import UploadedFileNestedSerializer
from trcustoms.users.models import User
from trcustoms.users.serializers import UserNestedSerializer


class LevelExternalLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = LevelExternalLink
        fields = ["id", "position", "url", "link_type"]


class LevelDifficultyNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = LevelDifficulty
        fields = ["id", "name"]


class LevelDifficultyListingSerializer(serializers.ModelSerializer):
    class Meta:
        model = LevelDifficulty
        fields = ["id", "name", "created", "last_updated"]


class LevelDurationNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = LevelDuration
        fields = ["id", "name"]


class LevelDurationListingSerializer(serializers.ModelSerializer):
    class Meta:
        model = LevelDuration
        fields = ["id", "name", "created", "last_updated"]


class LevelScreenshotSerializer(serializers.ModelSerializer):
    file = UploadedFileNestedSerializer(read_only=True)

    class Meta:
        model = LevelScreenshot
        fields = ["id", "position", "file"]


class LevelFileSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField(read_only=True)
    size = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = LevelFile
        fields = ["id", "version", "size", "created", "url"]

    def get_size(self, instance) -> int | None:
        if instance.file:
            return instance.file.size
        return None

    def get_url(self, instance) -> str | None:
        if instance.file and instance.file.content:
            return (
                settings.HOST_SITE + f"/api/level_files/{instance.id}/download"
            )
        return None


class LevelNestedSerializer(serializers.ModelSerializer):
    cover = UploadedFileNestedSerializer(read_only=True)

    class Meta:
        model = Level
        fields = ["id", "name", "cover"]


class LevelListingSerializer(serializers.ModelSerializer):
    name = CustomCharField(validators=[MaxLengthValidator(100)])
    description = serializers.CharField(validators=[MaxLengthValidator(5000)])
    rejection_reason = CustomCharField(
        validators=[MaxLengthValidator(500)], required=False, allow_blank=True
    )

    download_count = serializers.ReadOnlyField()
    rating_count = serializers.ReadOnlyField()
    review_count = serializers.ReadOnlyField()
    walkthrough_count = serializers.ReadOnlyField()

    is_approved = serializers.ReadOnlyField()
    rejection_reason = serializers.ReadOnlyField()
    rating_class = RatingClassNestedSerializer(read_only=True)

    engine = EngineNestedSerializer(read_only=True)
    engine_id = serializers.PrimaryKeyRelatedField(
        write_only=True, source="engine", queryset=Engine.objects.all()
    )

    duration = LevelDurationNestedSerializer(read_only=True)
    duration_id = serializers.PrimaryKeyRelatedField(
        write_only=True,
        source="duration",
        queryset=LevelDuration.objects.all(),
    )

    difficulty = LevelDifficultyNestedSerializer(read_only=True)
    difficulty_id = serializers.PrimaryKeyRelatedField(
        write_only=True,
        source="difficulty",
        queryset=LevelDifficulty.objects.all(),
    )

    genres = GenreNestedSerializer(read_only=True, many=True)
    genre_ids = serializers.PrimaryKeyRelatedField(
        write_only=True,
        many=True,
        source="genres",
        queryset=Genre.objects.all(),
    )

    tags = TagNestedSerializer(read_only=True, many=True)
    tag_ids = serializers.PrimaryKeyRelatedField(
        write_only=True,
        many=True,
        source="tags",
        queryset=Tag.objects.all(),
    )

    authors = UserNestedSerializer(read_only=True, many=True)
    author_ids = serializers.PrimaryKeyRelatedField(
        write_only=True,
        many=True,
        source="authors",
        queryset=User.objects.all(),
    )

    uploader = UserNestedSerializer(
        read_only=True,
        default=serializers.CreateOnlyDefault(
            serializers.CurrentUserDefault()
        ),
    )

    last_file = serializers.SerializerMethodField(read_only=True)
    cover = UploadedFileNestedSerializer(read_only=True)
    screenshots = LevelScreenshotSerializer(read_only=True, many=True)
    external_links = LevelExternalLinkSerializer(required=False, many=True)
    last_user_content_updated = serializers.ReadOnlyField()

    def get_last_file(self, instance: Level) -> dict[str, Any] | None:
        """Get last file ID from the LevelViewSet's annotated queryset."""
        if instance.last_file:
            return LevelFileSerializer(instance=instance.last_file).data
        return None

    class Meta:
        model = Level
        fields = [
            "id",
            "name",
            "description",
            "engine",
            "engine_id",
            "duration",
            "duration_id",
            "difficulty",
            "difficulty_id",
            "genres",
            "genre_ids",
            "tags",
            "tag_ids",
            "authors",
            "author_ids",
            "uploader",
            "created",
            "cover",
            "screenshots",
            "external_links",
            "last_updated",
            "last_user_content_updated",
            "last_file",
            "download_count",
            "rating_count",
            "review_count",
            "walkthrough_count",
            "is_approved",
            "rejection_reason",
            "rating_class",
        ]


class LevelDetailsSerializer(LevelListingSerializer):
    cover_id = serializers.PrimaryKeyRelatedField(
        write_only=True,
        source="cover",
        queryset=UploadedFile.objects.filter(
            upload_type__in=[
                # allow legacy dupes between covers and screenshots
                UploadType.LEVEL_COVER,
                UploadType.LEVEL_SCREENSHOT,
            ]
        ),
    )

    screenshot_ids = serializers.PrimaryKeyRelatedField(
        write_only=True,
        many=True,
        source="screenshots",
        queryset=UploadedFile.objects.filter(
            upload_type__in=[
                # allow legacy dupes between covers and screenshots
                UploadType.LEVEL_COVER,
                UploadType.LEVEL_SCREENSHOT,
            ],
        ),
    )

    files = serializers.SerializerMethodField(read_only=True)
    file_id = serializers.PrimaryKeyRelatedField(
        write_only=True,
        source="file",
        queryset=UploadedFile.objects.filter(
            upload_type=UploadType.LEVEL_FILE
        ),
    )

    def get_files(self, instance) -> dict | None:
        files = instance.files.active()
        serializer = LevelFileSerializer(
            instance=files, many=True, context=self.context
        )
        return serializer.data

    def validate(self, data):
        validated_data = super().validate(data)

        def validate_limits(
            queryset, field: str, min_count: int, max_count: int
        ) -> None:
            count = len(set(queryset))
            if count < min_count:
                raise serializers.ValidationError(
                    {field: f"At least {min_count} {field} must be added"}
                )
            if count > max_count:
                raise serializers.ValidationError(
                    {field: f"At most {max_count} {field} can be added"}
                )

        validate_limits(
            validated_data.get(
                "screenshots",
                self.instance.screenshots.all() if self.instance else [],
            ),
            "screenshots",
            settings.MIN_SCREENSHOTS,
            settings.MAX_SCREENSHOTS,
        )
        validate_limits(
            validated_data.get(
                "genres", self.instance.genres.all() if self.instance else []
            ),
            "genres",
            settings.MIN_GENRES,
            settings.MAX_GENRES,
        )
        validate_limits(
            validated_data.get(
                "tags", self.instance.tags.all() if self.instance else []
            ),
            "tags",
            settings.MIN_TAGS,
            settings.MAX_TAGS,
        )
        validate_limits(
            validated_data.get(
                "authors", self.instance.authors.all() if self.instance else []
            ),
            "authors",
            settings.MIN_AUTHORS,
            settings.MAX_AUTHORS,
        )

        return validated_data

    def handle_m2m(self, level_factory, validated_data):
        external_links = validated_data.pop("external_links", None)
        screenshots = validated_data.pop("screenshots", None)
        file = validated_data.pop("file", None)
        tags = validated_data.pop("tags", None)
        genres = validated_data.pop("genres", None)
        authors = validated_data.pop("authors", None)

        if "uploader" not in validated_data and (
            not self.instance or not self.instance.uploader
        ):
            validated_data["uploader"] = self.context["request"].user

        level = level_factory()

        if tags is not None:
            level.tags.set(tags)
        if genres is not None:
            level.genres.set(genres)
        if authors is not None:
            level.authors.set(authors)

        # be smart about the updates to make sure audit logs do not report
        # extraneous additions and deletions

        if external_links is not None:
            qs = LevelExternalLink.objects.filter(level=level)
            for external_link in external_links:
                qs = qs.exclude(
                    position=external_link["position"],
                    url=external_link["url"],
                )
            qs.delete()
            # first, try to update matching url positions
            for external_link in external_links:
                LevelExternalLink.objects.update_or_create(
                    level=level,
                    position=external_link["position"],
                    defaults=dict(
                        url=external_link["url"],
                        link_type=external_link["link_type"],
                    ),
                )

        if screenshots is not None:
            qs = LevelScreenshot.objects.filter(level=level)
            for i, screenshot in enumerate(screenshots):
                qs = qs.exclude(position=i, file=screenshot)
            qs.delete()
            # try to update matching files
            for i, screenshot in enumerate(screenshots):
                LevelScreenshot.objects.update_or_create(
                    level=level, position=i, defaults=dict(file=screenshot)
                )

        if file is not None and (
            not level.last_file or file != level.last_file.file
        ):
            LevelFile.objects.create(level=level, file=file)

        return level

    def create(self, validated_data):
        func = super().create

        def level_factory():
            level = func(validated_data)
            return level

        level = self.handle_m2m(level_factory, validated_data)
        send_level_submitted_mail(level)
        for author in level.authors.iterator():
            update_awards.delay(author.pk)
        return level

    def update(self, instance, validated_data):
        func = super().update

        prev_authors = list(instance.authors.all())

        def level_factory():
            level = func(instance, validated_data)
            return level

        level = self.handle_m2m(level_factory, validated_data)
        current_authors = list(level.authors.all())

        for author in [*prev_authors, *current_authors]:
            update_awards.delay(author.pk)
        return level

    class Meta:
        model = Level
        fields = LevelListingSerializer.Meta.fields + [
            "cover_id",
            "screenshot_ids",
            "files",
            "file_id",
            "trle_id",
        ]


class LevelRejectionSerializer(serializers.Serializer):
    reason = CustomCharField(max_length=500)


class FeaturedLevelListingSerializer(serializers.ModelSerializer):
    level = LevelListingSerializer(read_only=True)
    chosen_genre = GenreNestedSerializer(read_only=True)

    class Meta:
        model = FeaturedLevel
        fields = [
            "created",
            "feature_type",
            "level",
            "chosen_genre",
        ]


class FeaturedLevelsSerializer(serializers.Serializer):
    new_release = FeaturedLevelListingSerializer()
    monthly_hidden_gem = FeaturedLevelListingSerializer()
    level_of_the_day = FeaturedLevelListingSerializer()
    best_in_genre = FeaturedLevelListingSerializer()


class LevelCategoryRatingsSerializer(serializers.Serializer):
    category = serializers.CharField()
    total_points = serializers.IntegerField()
    min_points = serializers.IntegerField()
    max_points = serializers.IntegerField()


class LevelRatingStatsSerializer(serializers.Serializer):
    trc_rating_count = serializers.IntegerField()
    trle_rating_count = serializers.IntegerField()
    categories = LevelCategoryRatingsSerializer(many=True)
