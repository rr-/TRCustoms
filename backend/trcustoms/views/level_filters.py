from rest_framework import status, viewsets
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from trcustoms.models import (
    LevelDifficulty,
    LevelDuration,
    LevelEngine,
    LevelGenre,
    LevelTag,
)
from trcustoms.serializers import (
    LevelDifficultyLiteSerializer,
    LevelDurationLiteSerializer,
    LevelEngineLiteSerializer,
    LevelGenreLiteSerializer,
    LevelTagLiteSerializer,
)


class LevelFilterViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]

    def list(self, request) -> Response:
        level_tags = LevelTag.objects.all()
        level_genres = LevelGenre.objects.all()
        level_engines = LevelEngine.objects.all()
        level_difficulties = LevelDifficulty.objects.all()
        level_durations = LevelDuration.objects.all()
        return Response(
            {
                "tags": LevelTagLiteSerializer(level_tags, many=True).data,
                "genres": LevelGenreLiteSerializer(
                    level_genres, many=True
                ).data,
                "engines": LevelEngineLiteSerializer(
                    level_engines, many=True
                ).data,
                "difficulties": LevelDifficultyLiteSerializer(
                    level_difficulties, many=True
                ).data,
                "durations": LevelDurationLiteSerializer(
                    level_durations, many=True
                ).data,
            },
            status.HTTP_200_OK,
        )
