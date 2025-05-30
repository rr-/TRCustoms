from rest_framework import serializers

from trcustoms.community_events.models import Event, Winner
from trcustoms.levels.serializers import LevelListingSerializer
from trcustoms.uploads.serializers import UploadedFileNestedSerializer
from trcustoms.users.serializers import UserNestedSerializer


class WinnerSerializer(serializers.ModelSerializer):
    user = UserNestedSerializer(read_only=True)

    class Meta:
        model = Winner
        fields = ["place", "user"]


class EventListingSerializer(serializers.ModelSerializer):
    cover_image = UploadedFileNestedSerializer(read_only=True)
    level_count = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Event
        fields = [
            "id",
            "name",
            "subtitle",
            "cover_image",
            "year",
            "level_count",
            "created",
            "last_updated",
        ]

    def get_level_count(self, instance: Event) -> int:
        # Use annotated count of approved levels if present,
        # otherwise count related approved levels
        return getattr(
            instance,
            "level_count",
            instance.levels.filter(is_approved=True).count(),
        )


class EventDetailsSerializer(EventListingSerializer):
    host = UserNestedSerializer(read_only=True)
    winners = WinnerSerializer(read_only=True, many=True)
    about = serializers.CharField(read_only=True)
    levels = serializers.SerializerMethodField()

    class Meta(EventListingSerializer.Meta):
        fields = EventListingSerializer.Meta.fields + [
            "about",
            "host",
            "winners",
            "levels",
        ]

    def get_levels(self, instance: Event) -> list[dict]:
        """Only include levels that have been approved (exclude pending)."""
        qs = instance.levels.filter(is_approved=True)
        return LevelListingSerializer(qs, many=True, context=self.context).data
