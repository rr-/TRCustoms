from pathlib import Path

from django.conf import settings
from django.db import models
from django.http import HttpResponseRedirect
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.generics import get_object_or_404
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from trcustoms.models import LevelFile
from trcustoms.utils import slugify, stream_file_field


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

        if not settings.USE_AWS_STORAGE:
            return stream_file_field(
                file.file.content, parts, as_attachment=True
            )

        file_field = file.file.content

        path = Path(file_field.name)
        filename = "-".join(map(slugify, parts)) + path.suffix

        parameters = {
            "ResponseContentDisposition": (f"attachment; filename={filename}"),
        }

        # url = file_field.storage.url(file_field.name, parameters=parameters)

        client = file_field.storage.connection.meta.client
        url = client.generate_presigned_url(
            ClientMethod="get_object",
            ExpiresIn=60,
            Params={
                "Bucket": file_field.storage.bucket_name,
                "Key": file_field.storage._normalize_name(
                    file_field.storage._clean_name(file_field.name)
                ),
                **parameters,
            },
        )

        return HttpResponseRedirect(redirect_to=url)
