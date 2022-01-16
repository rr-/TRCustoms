from typing import Any

from rest_framework import serializers

from trcustoms.models import (
    Level,
    LevelDifficulty,
    LevelDuration,
    LevelEngine,
    LevelFile,
    LevelGenre,
    LevelMedium,
    LevelTag,
    UploadedFile,
    User,
)
from trcustoms.serializers.level_difficulties import (
    LevelDifficultyLiteSerializer,
)
from trcustoms.serializers.level_durations import LevelDurationLiteSerializer
from trcustoms.serializers.level_engines import LevelEngineLiteSerializer
from trcustoms.serializers.level_genres import LevelGenreLiteSerializer
from trcustoms.serializers.level_media import LevelMediumSerializer
from trcustoms.serializers.level_tags import LevelTagLiteSerializer
from trcustoms.serializers.uploaded_files import UploadedFileSerializer


class LevelUploaderSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name"]


class LevelAuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name"]


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


class LevelLiteSerializer(serializers.ModelSerializer):
    engine = LevelEngineLiteSerializer(read_only=True)
    engine_id = serializers.PrimaryKeyRelatedField(
        write_only=True, source="engine", queryset=LevelEngine.objects.all()
    )

    duration = LevelDurationLiteSerializer(read_only=True)
    duration_id = serializers.PrimaryKeyRelatedField(
        write_only=True,
        source="duration",
        queryset=LevelDuration.objects.all(),
    )

    difficulty = LevelDifficultyLiteSerializer(read_only=True)
    difficulty_id = serializers.PrimaryKeyRelatedField(
        write_only=True,
        source="difficulty",
        queryset=LevelDifficulty.objects.all(),
    )

    genres = LevelGenreLiteSerializer(read_only=True, many=True)
    genre_ids = serializers.PrimaryKeyRelatedField(
        write_only=True,
        many=True,
        source="genres",
        queryset=LevelGenre.objects.all(),
    )

    tags = LevelTagLiteSerializer(read_only=True, many=True)
    tag_ids = serializers.PrimaryKeyRelatedField(
        write_only=True,
        many=True,
        source="tags",
        queryset=LevelTag.objects.all(),
    )

    authors = LevelAuthorSerializer(read_only=True, many=True)
    author_ids = serializers.PrimaryKeyRelatedField(
        write_only=True,
        many=True,
        source="authors",
        queryset=User.objects.all(),
    )

    uploader = LevelUploaderSerializer(
        read_only=True,
        default=serializers.CreateOnlyDefault(
            serializers.CurrentUserDefault()
        ),
    )

    last_file = serializers.SerializerMethodField(read_only=True)

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
            "last_updated",
            "last_file",
            "download_count",
        ]


class LevelFullSerializer(LevelLiteSerializer):
    cover = UploadedFileSerializer(read_only=True)
    cover_id = serializers.PrimaryKeyRelatedField(
        write_only=True,
        source="cover",
        queryset=UploadedFile.objects.filter(
            upload_type=UploadedFile.UploadType.LEVEL_COVER
        ),
    )

    media = LevelMediumSerializer(read_only=True, many=True)
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

    def create(self, validated_data):
        screenshots = validated_data.pop("screenshots")
        file = validated_data.pop("file")
        tags = validated_data.pop("tags")
        genres = validated_data.pop("genres")
        authors = validated_data.pop("authors")
        level = Level.objects.create(**validated_data)
        level.tags.set(tags)
        level.genres.set(genres)
        level.authors.set(authors)
        level.uploader = self.context["request"].user
        for i, screenshot in enumerate(screenshots):
            LevelMedium.objects.create(
                level=level, position=i, file=screenshot
            )
        LevelFile.objects.create(level=level, file=file)
        return level

    def update(self, instance, validated_data):
        screenshots = validated_data.pop("screenshots", None)
        file = validated_data.pop("file", None)
        tags = validated_data.pop("tags", None)
        genres = validated_data.pop("genres", None)
        authors = validated_data.pop("authors", None)
        level = super().update(instance, validated_data)
        if tags is not None:
            level.tags.set(tags)
        if genres is not None:
            level.genres.set(genres)
        if authors is not None:
            level.authors.set(authors)
        if screenshots is not None:
            LevelMedium.objects.filter(level=level).delete()
            for i, screenshot in enumerate(screenshots):
                LevelMedium.objects.create(
                    level=level, position=i, file=screenshot
                )
        if file is not None and (
            not level.last_file or file != level.last_file.file
        ):
            LevelFile.objects.create(level=level, file=file)
        return level

    class Meta:
        model = Level
        fields = LevelLiteSerializer.Meta.fields + [
            "cover",
            "cover_id",
            "media",
            "screenshot_ids",
            "files",
            "file_id",
            "trle_id",
            "is_approved",
        ]
