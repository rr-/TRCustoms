from rest_framework import status, viewsets
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from trcustoms.models import LevelEngine, LevelGenre, LevelTag
from trcustoms.serializers import (
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
        return Response(
            {
                "tags": LevelTagLiteSerializer(level_tags, many=True).data,
                "genres": LevelGenreLiteSerializer(
                    level_genres, many=True
                ).data,
                "engines": LevelEngineLiteSerializer(
                    level_engines, many=True
                ).data,
            },
            status.HTTP_200_OK,
        )
