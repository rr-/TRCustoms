from django.db.models import F, Value
from django.db.models.functions import Coalesce, Concat
from rest_framework import filters, mixins, viewsets
from rest_framework.permissions import AllowAny

from trcustoms.models import Level
from trcustoms.serializers import LevelSerializer


class LevelViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    permission_classes = [AllowAny]

    queryset = Level.objects.all().annotate(
        author=Coalesce(
            "author_name",
            "author_user__username",
            Concat(
                "author_user__first_name",
                Value(" "),
                "author_user__last_name",
            ),
        ),
        engine_name=F("engine__name"),
    )
    serializer_class = LevelSerializer

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    ordering_fields = ["name", "author", "engine", "created", "last_updated"]
    search_fields = ["name", "author_name", "author_user__username"]
