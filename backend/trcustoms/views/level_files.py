from django.db import models
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.generics import get_object_or_404
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from trcustoms.models import LevelFile
from trcustoms.utils import stream_file_field


class LevelFileViewSet(viewsets.GenericViewSet):
    permission_classes = [AllowAny]
    queryset = LevelFile.objects.all()
    pagination_class = None
    download_count = models.IntegerField(default=0)

    @action(detail=True)
    def download(self, request, pk: int) -> Response:
        file = get_object_or_404(LevelFile, pk=pk)
        parts = [f"{pk}", file.level.name]
        if file.version > 1:
            parts.append(f"V{file.version}")
        parts.extend(file.level.authors.values_list("username", flat=True))

        file.download_count += 1
        file.save()

        return stream_file_field(file.file.content, parts, as_attachment=True)
