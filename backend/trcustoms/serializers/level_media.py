from rest_framework import serializers

from trcustoms.models import LevelMedium
from trcustoms.serializers.uploaded_files import UploadedFileSerializer


class LevelMediumSerializer(serializers.ModelSerializer):
    file = UploadedFileSerializer(read_only=True)

    class Meta:
        model = LevelMedium
        fields = ["id", "file"]
