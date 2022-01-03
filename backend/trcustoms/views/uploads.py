from rest_framework import status, viewsets
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from trcustoms.models import UploadedFile
from trcustoms.serializers import UploadedFileSerializer


class UploadViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]

    parser_classes = [MultiPartParser]

    def create(self, request) -> Response:
        uploaded_file = UploadedFile(uploader=request.user)
        serializer = UploadedFileSerializer(uploaded_file, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status.HTTP_200_OK)
        return Response(serializer.errors, status.HTTP_400_BAD_REQUEST)
