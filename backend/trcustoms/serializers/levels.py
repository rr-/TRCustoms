from typing import Any

from django.conf import settings
from rest_framework import serializers

from trcustoms import snapshots
from trcustoms.models import (
    Level,
    LevelDifficulty,
    LevelDuration,
    LevelEngine,
    LevelExternalLink,
    LevelFile,
    LevelGenre,
    LevelScreenshot,
    LevelTag,
    UploadedFile,
    User,
)
from trcustoms.serializers.level_difficulties import (
    LevelDifficultyNestedSerializer,
)
from trcustoms.serializers.level_durations import LevelDurationNestedSerializer
from trcustoms.serializers.level_engines import LevelEngineNestedSerializer
from trcustoms.serializers.level_external_links import (
    LevelExternalLinkSerializer,
)
from trcustoms.serializers.level_genres import LevelGenreNestedSerializer
from trcustoms.serializers.level_screenshots import LevelScreenshotSerializer
from trcustoms.serializers.level_tags import LevelTagNestedSerializer
from trcustoms.serializers.uploaded_files import UploadedFileNestedSerializer
from trcustoms.serializers.users import UserNestedSerializer


class LevelNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Level
        fields = ["id", "name"]


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
            return f"/api/level_files/{instance.id}/download"
        return None


class LevelListingSerializer(serializers.ModelSerializer):
    engine = LevelEngineNestedSerializer(read_only=True)
    engine_id = serializers.PrimaryKeyRelatedField(
        write_only=True, source="engine", queryset=LevelEngine.objects.all()
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

    genres = LevelGenreNestedSerializer(read_only=True, many=True)
    genre_ids = serializers.PrimaryKeyRelatedField(
        write_only=True,
        many=True,
        source="genres",
        queryset=LevelGenre.objects.all(),
    )

    tags = LevelTagNestedSerializer(read_only=True, many=True)
    tag_ids = serializers.PrimaryKeyRelatedField(
        write_only=True,
        many=True,
        source="tags",
        queryset=LevelTag.objects.all(),
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
            "last_file",
            "download_count",
        ]


class LevelDetailsSerializer(LevelListingSerializer):
    is_approved = serializers.ReadOnlyField()
    disapproval_reason = serializers.ReadOnlyField()

    cover_id = serializers.PrimaryKeyRelatedField(
        write_only=True,
        source="cover",
        queryset=UploadedFile.objects.filter(
            upload_type=UploadedFile.UploadType.LEVEL_COVER
        ),
    )

    screenshot_ids = serializers.PrimaryKeyRelatedField(
        write_only=True,
        many=True,
        source="screenshots",
        queryset=UploadedFile.objects.filter(
            upload_type=UploadedFile.UploadType.LEVEL_SCREENSHOT
        ),
    )

    files = LevelFileSerializer(read_only=True, many=True)
    file_id = serializers.PrimaryKeyRelatedField(
        write_only=True,
        source="file",
        queryset=UploadedFile.objects.filter(
            upload_type=UploadedFile.UploadType.LEVEL_FILE
        ),
    )

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

    @staticmethod
    def handle_m2m(level_factory, validated_data):
        external_links = validated_data.pop("external_links", None)
        screenshots = validated_data.pop("screenshots", None)
        file = validated_data.pop("file", None)
        tags = validated_data.pop("tags", None)
        genres = validated_data.pop("genres", None)
        authors = validated_data.pop("authors", None)

        level = level_factory()

        if tags is not None:
            level.tags.set(tags)
        if genres is not None:
            level.genres.set(genres)
        if authors is not None:
            level.authors.set(authors)

        # be smart about the updates to make sure snapshots do not report
        # extraneous additions and deletions

        if external_links is not None:
            LevelExternalLink.objects.filter(level=level).exclude(
                position__in=[
                    external_link["position"]
                    for external_link in external_links
                ]
            ).delete()
            # first, try to update matching url positions
            for external_link in external_links:
                LevelExternalLink.objects.update_or_create(
                    level=level,
                    url=external_link["url"],
                    defaults=dict(
                        position=external_link["position"],
                        link_type=external_link["link_type"],
                    ),
                )
            # next, try to update matching position urls
            for external_link in external_links:
                LevelExternalLink.objects.update_or_create(
                    level=level,
                    position=external_link["position"],
                    defaults=dict(
                        link_type=external_link["link_type"],
                        url=external_link["url"],
                    ),
                )

        if screenshots is not None:
            LevelScreenshot.objects.filter(
                level=level, position__gte=len(screenshots)
            ).delete()
            # first, try to update matching file positions
            for i, screenshot in enumerate(screenshots):
                LevelScreenshot.objects.update_or_create(
                    level=level, file=screenshot, defaults=dict(position=i)
                )
            # next, try to update matching position files
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
            return func(validated_data)

        return self.handle_m2m(level_factory, validated_data)

    def update(self, instance, validated_data):
        func = super().update

        def level_factory():
            return func(instance, validated_data)

        return self.handle_m2m(level_factory, validated_data)

    class Meta:
        model = Level
        fields = LevelListingSerializer.Meta.fields + [
            "cover_id",
            "screenshot_ids",
            "files",
            "file_id",
            "trle_id",
            "is_approved",
            "disapproval_reason",
        ]


@snapshots.register
class LevelSnapshotSerializer(LevelDetailsSerializer):
    pass


class LevelDisapprovalSerializer(serializers.Serializer):
    reason = serializers.CharField(max_length=200)
