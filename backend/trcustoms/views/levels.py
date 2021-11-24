from rest_framework import mixins, viewsets
from rest_framework.permissions import AllowAny

from trcustoms.models import Level
from trcustoms.serializers import LevelSerializer


class LevelViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    permission_classes = [AllowAny]

    queryset = Level.objects.all()
    serializer_class = LevelSerializer
