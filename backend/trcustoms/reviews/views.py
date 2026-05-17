from rest_framework import mixins, status, viewsets
from rest_framework.generics import get_object_or_404
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from trcustoms.audit_logs.utils import (
    clear_audit_log_action_flags,
    track_model_deletion,
)
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
from trcustoms.reviews.models import Review
from trcustoms.reviews.serializers import (
    ReviewDeletionSerializer,
    ReviewDetailsSerializer,
    ReviewListingSerializer,
)
from trcustoms.users.models import UserPermission
from trcustoms.utils import parse_ints


class ReviewViewSet(
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
    queryset = Review.objects.all().prefetch_related(
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
        "level__name",
        "level_id",
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

    serializer_class = ReviewListingSerializer
    serializer_class_by_action = {
        "retrieve": ReviewDetailsSerializer,
        "update": ReviewDetailsSerializer,
        "partial_update": ReviewDetailsSerializer,
        "create": ReviewDetailsSerializer,
        "destroy": ReviewDeletionSerializer,
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

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        review_id = instance.pk
        audit_log_instance = self.get_queryset().get(pk=review_id)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.notify(instance)
        clear_audit_log_action_flags(obj=audit_log_instance)
        track_model_deletion(
            audit_log_instance, request=self.request, notify=True
        )
        Review.objects.filter(pk=review_id).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
