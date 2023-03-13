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
            "position",
            "code",
            "title",
            "description",
            "tier",
            "rarity",
        ]
