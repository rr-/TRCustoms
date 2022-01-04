from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.generics import get_object_or_404
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from trcustoms.mixins import PermissionsMixin
from trcustoms.models import UploadedFile
from trcustoms.serializers import UploadedFileSerializer
from trcustoms.utils import stream_file_field


class UploadViewSet(PermissionsMixin, viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]
    permission_classes_by_action = {
        "retrieve": [AllowAny],
        "file": [AllowAny],
    }

    parser_classes = [MultiPartParser]

    def create(self, request) -> Response:
        uploaded_file = UploadedFile(uploader=request.user)
        serializer = UploadedFileSerializer(uploaded_file, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status.HTTP_200_OK)
        return Response(serializer.errors, status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, pk) -> Response:
        uploaded_file = get_object_or_404(UploadedFile, pk=pk)
        return Response(
            UploadedFileSerializer(uploaded_file).data, status.HTTP_200_OK
        )

    @action(detail=True)
    def file(self, request, pk) -> Response:
        uploaded_file = get_object_or_404(UploadedFile, pk=pk)
        return stream_file_field(
            uploaded_file.content, ["upload"], as_attachment=False
        )
