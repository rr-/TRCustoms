from rest_framework import serializers

from trcustoms.models import UploadedFile


class UploadedFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UploadedFile
        fields = ["id", "content", "upload_type"]

    def validate_content(self, file):
        # TODO: customize this limit
        max_file_size = 300 * 1024
        if file.size > max_file_size:
            raise serializers.ValidationError(
                f"Maximum allowed size: {max_file_size/1024:.02f} KB"
            )
        return file
