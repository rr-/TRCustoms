from rest_framework import serializers

from trcustoms.models import AuditLog
from trcustoms.serializers.users import UserNestedSerializer


class AuditLogListingSerializer(serializers.ModelSerializer):
    object_type = serializers.SerializerMethodField(read_only=True)
    change_author = UserNestedSerializer(read_only=True)

    class Meta:
        model = AuditLog
        fields = [
            "id",
            "created",
            "object_id",
            "object_name",
            "object_type",
            "change_type",
            "change_author",
            "changes",
            "is_action_required",
        ]

    def get_object_type(self, instance: AuditLog) -> str:
        return instance.object_type.model
