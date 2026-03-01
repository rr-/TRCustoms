from datetime import datetime

from rest_framework import serializers

from trcustoms.awards.logic import get_award_rarity, get_award_user_percentage
from trcustoms.awards.models import UserAward
from trcustoms.users.serializers import UserNestedSerializer


class AwardSpecSerializer(serializers.Serializer):
    code = serializers.CharField()
    title = serializers.CharField()
    description = serializers.CharField()
    guide_description = serializers.SerializerMethodField()
    tier = serializers.IntegerField()
    can_be_removed = serializers.BooleanField()
    rarity = serializers.SerializerMethodField()
    user_percentage = serializers.SerializerMethodField()

    def get_guide_description(self, obj):
        return obj.guide_description

    def get_rarity(self, obj) -> int:
        return get_award_rarity(obj.code, obj.tier)

    def get_user_percentage(self, obj) -> int:
        return get_award_user_percentage(obj.code, obj.tier)


class AwardRecipientSerializer(serializers.ModelSerializer):
    user = UserNestedSerializer(read_only=True)
    awarded_on = serializers.SerializerMethodField()

    def get_awarded_on(self, obj: UserAward) -> datetime | None:
        return obj.last_updated or obj.created

    class Meta:
        model = UserAward
        fields = ["user", "created", "last_updated", "awarded_on"]
