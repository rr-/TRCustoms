from rest_framework import serializers

from trcustoms.awards.logic import get_award_rarity
from trcustoms.awards.models import UserAward


class UserAwardSerializer(serializers.ModelSerializer):
    rarity = serializers.SerializerMethodField()

    def get_rarity(self, instance: UserAward) -> int:
        return get_award_rarity(instance.code, instance.tier)

    class Meta:
        model = UserAward
        fields = [
            "created",
            "last_updated",
            "position",
            "code",
            "title",
            "description",
            "tier",
            "rarity",
        ]


class AwardSpecSerializer(serializers.Serializer):
    code = serializers.CharField()
    title = serializers.CharField()
    description = serializers.CharField()
    guide_description = serializers.SerializerMethodField()
    tier = serializers.IntegerField()
    can_be_removed = serializers.BooleanField()

    def get_guide_description(self, obj):
        return obj.guide_description
