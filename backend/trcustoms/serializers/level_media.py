from rest_framework import serializers

from trcustoms.models import LevelMedium
from trcustoms.serializers.uploaded_files import UploadedFileNestedSerializer


class LevelMediumSerializer(serializers.ModelSerializer):
    file = UploadedFileNestedSerializer(read_only=True)

    class Meta:
        model = LevelMedium
        fields = ["id", "position", "file"]
