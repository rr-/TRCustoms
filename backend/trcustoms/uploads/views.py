from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.generics import get_object_or_404
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from trcustoms.common.serializers import EmptySerializer
from trcustoms.mixins import PermissionsMixin
from trcustoms.tasks.convert_images import RECOMMENDED_SIZE, convert_image
from trcustoms.uploads.consts import UploadType
from trcustoms.uploads.models import UploadedFile
from trcustoms.uploads.serializers import UploadedFileDetailsSerializer
from trcustoms.utils import stream_file_field


def schedule_image_conversion_if_needed(uploaded_file: UploadedFile) -> None:
    if uploaded_file.upload_type not in {
        UploadType.LEVEL_SCREENSHOT,
        UploadType.LEVEL_COVER,
    }:
        return

    if uploaded_file.size <= RECOMMENDED_SIZE:
        return

    convert_image.apply_async((uploaded_file.id,), countdown=30)


@extend_schema_view(
    file=extend_schema(
        request=EmptySerializer,
        responses={status.HTTP_200_OK: EmptySerializer},
    )
)
class UploadViewSet(PermissionsMixin, viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]
    permission_classes_by_action = {
        "retrieve": [AllowAny],
        "file": [AllowAny],
    }
    serializer_class = UploadedFileDetailsSerializer

    parser_classes = [MultiPartParser]

    def create(self, request) -> Response:
        uploaded_file = UploadedFile(uploader=request.user)
        serializer = UploadedFileDetailsSerializer(
            uploaded_file, data=request.data
        )
        if serializer.is_valid():
            serializer.save()
            schedule_image_conversion_if_needed(uploaded_file)
            return Response(serializer.data, status.HTTP_200_OK)
        return Response(serializer.errors, status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, pk) -> Response:
        uploaded_file = get_object_or_404(UploadedFile, pk=pk)
        return Response(
            UploadedFileDetailsSerializer(uploaded_file).data,
            status.HTTP_200_OK,
        )

    @action(detail=True)
    def file(self, request, pk) -> Response:
        uploaded_file = get_object_or_404(UploadedFile, pk=pk)
        return stream_file_field(
            uploaded_file.content, ["upload"], as_attachment=False
        )
