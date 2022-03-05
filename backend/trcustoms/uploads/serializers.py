from rest_framework import serializers

from trcustoms.uploads.models import UploadedFile

MAX_SIZE_MAP = {
    UploadedFile.UploadType.USER_PICTURE: 300 * 1024,  # 300 KB
    UploadedFile.UploadType.LEVEL_COVER: 1024 * 1024,  # 1 MB
    UploadedFile.UploadType.LEVEL_SCREENSHOT: 1024 * 1024,  # 1 MB
    UploadedFile.UploadType.LEVEL_FILE: 1024 * 1024 * 1024,  # 1 GB
}

CONTENT_TYPE_MAP = {
    UploadedFile.UploadType.USER_PICTURE: ["image/jpeg", "image/png"],
    UploadedFile.UploadType.LEVEL_COVER: ["image/jpeg"],
    UploadedFile.UploadType.LEVEL_SCREENSHOT: ["image/jpeg"],
    UploadedFile.UploadType.LEVEL_FILE: [
        "application/zip",
        "application/zip-compressed",
        "application/x-zip-compressed",
    ],
}


class UploadedFileNestedSerializer(serializers.ModelSerializer):
    size = serializers.ReadOnlyField()
    url = serializers.SerializerMethodField(read_only=True)
    md5sum = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = UploadedFile
        fields = [
            "id",
            "content",
            "upload_type",
            "url",
            "size",
            "md5sum",
        ]

    def get_url(self, instance) -> str | None:
        if not instance.content:
            return None
        return instance.content.url

    def get_md5sum(self, instance) -> str | None:
        if not instance.content:
            return None
        return instance.md5sum


class UploadedFileDetailsSerializer(serializers.ModelSerializer):
    size = serializers.ReadOnlyField()
    url = serializers.SerializerMethodField(read_only=True)
    md5sum = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = UploadedFile
        fields = [
            "id",
            "content",
            "upload_type",
            "url",
            "size",
            "md5sum",
        ]

    def validate(self, data):
        try:
            max_file_size = MAX_SIZE_MAP[data["upload_type"]]
            allowed_content_types = CONTENT_TYPE_MAP[data["upload_type"]]
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

        if data["content"].content_type.lower() not in allowed_content_types:
            raise serializers.ValidationError(
                {
                    "content": (
                        f"Invalid file type ({data['content'].content_type}). "
                        "Allowed types: "
                        f"{', '.join(allowed_content_types)}"
                    )
                }
            )

        if data["content"].size > max_file_size:
            raise serializers.ValidationError(
                {
                    "content": (
                        f"Maximum allowed size: {max_file_size/1024:.02f} KB"
                    )
                }
            )

        return data

    def get_url(self, instance) -> str | None:
        if not instance.content:
            return None
        return instance.content.url

    def get_md5sum(self, instance) -> str | None:
        if not instance.content:
            return None
        return instance.md5sum
