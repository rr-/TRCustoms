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

    class Meta:
        model = LevelFile
        fields = ["id", "version", "size", "created", "url"]

    def get_url(self, instance) -> str:
        return f"/api/level_files/{instance.id}/download"


class LevelLiteSerializer(serializers.ModelSerializer):
    genres = LevelGenreLiteSerializer(read_only=True, many=True)
    tags = LevelTagLiteSerializer(read_only=True, many=True)
    engine = LevelEngineLiteSerializer(read_only=True)
    new_difficulty = LevelDifficultyLiteSerializer(read_only=True)
    new_duration = LevelDurationLiteSerializer(read_only=True)
    uploader = LevelUploaderSerializer(read_only=True)
    authors = LevelAuthorSerializer(read_only=True, many=True)
    last_file = serializers.SerializerMethodField(read_only=True)

    def get_last_file(self, instance: Level) -> dict[str, Any] | None:
        """Get last file ID from the LevelViewSet's annotated queryset."""
        if instance.last_file_id:
            return LevelFileSerializer(
                instance=LevelFile(
                    id=instance.last_file_id,
                    version=instance.last_file_version,
                    created=instance.last_file_created,
                    size=instance.last_file_size,
                )
            ).data
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
            "new_difficulty",
            "new_duration",
        ]


class LevelFullSerializer(LevelLiteSerializer):
    banner = serializers.SerializerMethodField(read_only=True)
    media = serializers.SerializerMethodField(read_only=True)
    files = LevelFileSerializer(read_only=True, many=True)

    class Meta:
        model = Level
        fields = LevelLiteSerializer.Meta.fields + [
            "banner",
            "media",
            "trle_id",
            "files",
        ]

    def get_banner(self, instance: Level):
        return LevelMediumSerializer(
            instance=instance.media.filter(position=0).first()
        ).data

    def get_media(self, instance: Level):
        return LevelMediumSerializer(
            instance=instance.media.exclude(position=0), many=True
        ).data
