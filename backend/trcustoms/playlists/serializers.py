from rest_framework import serializers

from trcustoms.levels.models import Level
from trcustoms.levels.serializers import LevelNestedSerializer
from trcustoms.permissions import UserPermission, has_permission
from trcustoms.playlists.models import PlaylistItem
from trcustoms.users.models import User
from trcustoms.users.serializers import UserNestedSerializer


class PlaylistItemSerializer(serializers.ModelSerializer):
    user = UserNestedSerializer(read_only=True)
    level = LevelNestedSerializer(read_only=True)
    level_id = serializers.PrimaryKeyRelatedField(
        write_only=True,
        source="level",
        queryset=Level.objects.all(),
    )

    def get_user(self):
        auth_user = self.context["request"].user
        user_id = self.context["user_id"]
        user = User.objects.get(pk=user_id)
        if auth_user.pk != user.pk and not has_permission(
            auth_user, UserPermission.EDIT_PLAYLISTS
        ):
            raise serializers.ValidationError(
                {
                    "detail": (
                        "Cannot assign a different user "
                        "to this playlist item."
                    )
                }
            )
        return user

    def validate(self, data):
        validated_data = super().validate(data)

        validated_data["user"] = self.get_user()

        level = validated_data.get("level")
        user = validated_data["user"]
        if level and (
            PlaylistItem.objects.filter(level=level, user=user)
            .exclude(id=self.instance.id if self.instance else None)
            .exists()
        ):
            raise serializers.ValidationError(
                {"level_id": "This level already appears in this playlist."}
            )

        return validated_data

    class Meta:
        model = PlaylistItem
        fields = [
            "id",
            "level",
            "level_id",
            "user",
            "status",
            "created",
            "last_updated",
        ]
