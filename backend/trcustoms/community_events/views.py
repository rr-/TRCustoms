from rest_framework import mixins, viewsets
from rest_framework.permissions import AllowAny

from trcustoms.community_events.models import Event
from trcustoms.community_events.serializers import (
    EventDetailsSerializer,
    EventListingSerializer,
)
from trcustoms.mixins import AuditLogModelWatcherMixin, MultiSerializerMixin


class EventViewSet(
    AuditLogModelWatcherMixin,
    MultiSerializerMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    queryset = (
        Event.objects.with_counts()
        .select_related("cover_image", "host__picture")
        .prefetch_related("levels__cover", "winners__user__picture")
    )
    search_fields = ["name", "subtitle"]
    ordering_fields = ["collection_release"]
    permission_classes = [AllowAny]

    serializer_class = EventListingSerializer
    serializer_class_by_action = {"retrieve": EventDetailsSerializer}

    def get_queryset(self):
        qs = super().get_queryset()
        year = self.request.query_params.get("year")
        if year is not None:
            qs = qs.filter(year=year)
        return qs
