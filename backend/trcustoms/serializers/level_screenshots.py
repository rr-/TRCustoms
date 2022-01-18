from rest_framework import serializers

from trcustoms.models import LevelScreenshot
from trcustoms.serializers.uploaded_files import UploadedFileNestedSerializer


class LevelScreenshotSerializer(serializers.ModelSerializer):
    file = UploadedFileNestedSerializer(read_only=True)

    class Meta:
        model = LevelScreenshot
        fields = ["id", "position", "file"]
