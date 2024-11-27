from rest_framework import mixins, viewsets
from rest_framework.generics import get_object_or_404
from rest_framework.permissions import AllowAny, IsAuthenticated

from trcustoms.mixins import (
    AuditLogModelWatcherMixin,
    MultiSerializerMixin,
    PermissionsMixin,
)
from trcustoms.permissions import (
    AllowNone,
    HasPermission,
    IsAccessingOwnResource,
)
from trcustoms.ratings.models import Rating
from trcustoms.ratings.serializers import (
    RatingDetailsSerializer,
    RatingListingSerializer,
)
from trcustoms.users.models import UserPermission
from trcustoms.utils import parse_ints


class RatingViewSet(
    AuditLogModelWatcherMixin,
    PermissionsMixin,
    MultiSerializerMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    queryset = Rating.objects.all().prefetch_related(
        "rating_class",
        "author",
        "author__picture",
        "level",
        "level__cover",
    )

    search_fields = [
        "author__first_name",
        "author__last_name",
        "author__username",
        "level__name",
    ]

    ordering_fields = [
        "author__username",
        "created",
        "last_updated",
        "last_user_content_updated",
        "rating_class__position",
        "level__name",
        "level_id",
        "trle_score_atmosphere",
        "trle_score_enemies",
        "trle_score_gameplay",
        "trle_score_lighting",
    ]

    permission_classes = [AllowNone]
    permission_classes_by_action = {
        "retrieve": [AllowAny],
        "list": [AllowAny],
        "create": [IsAuthenticated],
        "destroy": [
            HasPermission(UserPermission.DELETE_RATINGS)
            | IsAccessingOwnResource
        ],
        "update": [
            HasPermission(UserPermission.EDIT_RATINGS) | IsAccessingOwnResource
        ],
        "partial_update": [
            HasPermission(UserPermission.EDIT_RATINGS) | IsAccessingOwnResource
        ],
    }

    serializer_class = RatingListingSerializer
    serializer_class_by_action = {
        "retrieve": RatingDetailsSerializer,
        "update": RatingDetailsSerializer,
        "partial_update": RatingDetailsSerializer,
        "create": RatingDetailsSerializer,
    }

    def get_object(self):
        obj = get_object_or_404(self.get_queryset(), pk=self.kwargs["pk"])
        self.check_object_permissions(self.request, obj)
        return obj

    def get_queryset(self):
        queryset = super().get_queryset()

        if author_ids := parse_ints(self.request.query_params.get("authors")):
            for author_id in author_ids:
                queryset = queryset.filter(author_id=author_id)

        if level_ids := parse_ints(self.request.query_params.get("levels")):
            for level_id in level_ids:
                queryset = queryset.filter(level_id=level_id)

        return queryset
