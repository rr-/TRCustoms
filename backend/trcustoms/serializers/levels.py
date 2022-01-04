from typing import Any

from rest_framework import serializers

from trcustoms.models import Level, LevelFile, User
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
    genres = LevelGenreLiteSerializer(read_only=True, many=True)
    tags = LevelTagLiteSerializer(read_only=True, many=True)
    engine = LevelEngineLiteSerializer(read_only=True)
    difficulty = LevelDifficultyLiteSerializer(read_only=True)
    duration = LevelDurationLiteSerializer(read_only=True)
    uploader = LevelUploaderSerializer(read_only=True)
    authors = LevelAuthorSerializer(read_only=True, many=True)
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
            "genres",
            "tags",
            "engine",
            "authors",
            "uploader",
            "created",
            "last_updated",
            "last_file",
            "download_count",
            "difficulty",
            "duration",
        ]


class LevelFullSerializer(LevelLiteSerializer):
    banner = UploadedFileSerializer(read_only=True)
    media = LevelMediumSerializer(read_only=True, many=True)
    files = LevelFileSerializer(read_only=True, many=True)

    class Meta:
        model = Level
        fields = LevelLiteSerializer.Meta.fields + [
            "banner",
            "media",
            "trle_id",
            "files",
        ]
