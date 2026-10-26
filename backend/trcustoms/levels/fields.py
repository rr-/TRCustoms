from rest_framework import serializers

from trcustoms.levels.models import Level


class VisibleLevelField(serializers.PrimaryKeyRelatedField):
    def get_queryset(self):
        return Level.objects.visible_to(self.context["request"].user)
