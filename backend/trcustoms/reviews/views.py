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
from trcustoms.reviews.models import LevelReview
from trcustoms.reviews.serializers import (
    LevelReviewDetailsSerializer,
    LevelReviewListingSerializer,
)
from trcustoms.users.models import UserPermission
from trcustoms.utils import parse_ints


class LevelReviewViewSet(
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
    queryset = LevelReview.objects.all().prefetch_related(
        "rating_class",
        "author",
        "author__picture",
        "level",
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
        "level__name",
        "level_id",
        "trle_rating_atmosphere",
        "trle_rating_enemies",
        "trle_rating_gameplay",
        "trle_rating_lighting",
    ]

    permission_classes = [AllowNone]
    permission_classes_by_action = {
        "retrieve": [AllowAny],
        "list": [AllowAny],
        "create": [IsAuthenticated],
        "destroy": [HasPermission(UserPermission.DELETE_REVIEWS)],
        "update": [
            HasPermission(UserPermission.EDIT_REVIEWS) | IsAccessingOwnResource
        ],
        "partial_update": [
            HasPermission(UserPermission.EDIT_REVIEWS) | IsAccessingOwnResource
        ],
    }

    serializer_class = LevelReviewListingSerializer
    serializer_class_by_action = {
        "retrieve": LevelReviewDetailsSerializer,
        "update": LevelReviewDetailsSerializer,
        "partial_update": LevelReviewDetailsSerializer,
        "create": LevelReviewDetailsSerializer,
    }

    def get_object(self):
        obj = get_object_or_404(self.get_queryset(), pk=self.kwargs["pk"])
        self.check_object_permissions(self.request, obj)
        return obj

    def get_queryset(self):
        queryset = self.queryset

        if author_ids := parse_ints(self.request.query_params.get("authors")):
            for author_id in author_ids:
                queryset = queryset.filter(author_id=author_id)

        if level_ids := parse_ints(self.request.query_params.get("levels")):
            for level_id in level_ids:
                queryset = queryset.filter(level_id=level_id)

        return queryset
