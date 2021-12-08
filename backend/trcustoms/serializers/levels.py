from typing import Optional

from rest_framework import serializers

from trcustoms.models import Level, LevelEngine, LevelGenre, LevelTag
from trcustoms.serializers.users import UserSerializer


class LevelGenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = LevelGenre
        fields = ["id", "name"]


class LevelTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = LevelTag
        fields = ["id", "name"]


class LevelEngineSerializer(serializers.ModelSerializer):
    class Meta:
        model = LevelEngine
        fields = ["id", "name"]


class LevelSerializer(serializers.ModelSerializer):
    genres = LevelGenreSerializer(read_only=True, many=True)
    tags = LevelTagSerializer(read_only=True, many=True)
    engine = LevelEngineSerializer(read_only=True)
    uploader = UserSerializer(read_only=True)
    author_user = UserSerializer(read_only=True)
    last_file_id = serializers.SerializerMethodField(read_only=True)
    last_file_size = serializers.SerializerMethodField(read_only=True)

    def get_last_file_size(self, instance: Level) -> Optional[int]:
        return instance.last_file_size

    def get_last_file_id(self, instance: Level) -> Optional[str]:
        return instance.last_file_id

    class Meta:
        model = Level
        fields = [
            "id",
            "name",
            "description",
            "genres",
            "tags",
            "engine",
            "author_name",
            "author_user",
            "uploader",
            "created",
            "last_updated",
            "last_file_size",
            "last_file_id",
        ]
