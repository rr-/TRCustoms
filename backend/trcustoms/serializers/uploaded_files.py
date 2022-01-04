from rest_framework import serializers

from trcustoms.models import UploadedFile

MAX_SIZE_MAP = {
    UploadedFile.UploadType.USER_PICTURE: 300 * 1024,  # 300 KB
    UploadedFile.UploadType.LEVEL_BANNER: 1024 * 1024,  # 1 MB
    UploadedFile.UploadType.LEVEL_SCREENSHOT: 1024 * 1024,  # 1 MB
    UploadedFile.UploadType.LEVEL_FILE: 1024 * 1024 * 1024,  # 1 GB
}


class UploadedFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UploadedFile
        fields = ["id", "content", "upload_type"]

    def validate(self, data):
        try:
            max_file_size = MAX_SIZE_MAP[data["upload_type"]]
        except KeyError:
            raise serializers.ValidationError(
                {
                    "upload_type": (
                        "Invalid upload type. Valid values include: "
                        + ",".join(map(repr(MAX_SIZE_MAP.keys())))
                    )
                }
            ) from None

        if not data.get("content"):
            raise serializers.ValidationError({"content": "Missing file."})

        if data["content"].size > max_file_size:
            raise serializers.ValidationError(
                {
                    "content": (
                        f"Maximum allowed size: {max_file_size/1024:.02f} KB"
                    )
                }
            )

        return data
