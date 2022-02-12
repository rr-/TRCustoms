from django.db.models import Count, OuterRef, Subquery
from django.http import Http404
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from trcustoms.mixins import (
    AuditLogModelWatcherMixin,
    MultiSerializerMixin,
    PermissionsMixin,
)
from trcustoms.models import Level, LevelTag
from trcustoms.models.user import UserPermission
from trcustoms.permissions import AllowNone, HasPermission
from trcustoms.serializers import (
    LevelTagDetailsSerializer,
    LevelTagListingSerializer,
)


class LevelTagViewSet(
    AuditLogModelWatcherMixin,
    PermissionsMixin,
    MultiSerializerMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = LevelTag.objects.with_counts()
    search_fields = ["name"]
    ordering_fields = ["name", "level_count", "created", "last_updated"]

    permission_classes = [AllowNone]
    permission_classes_by_action = {
        "list": [AllowAny],
        "retrieve": [IsAuthenticated],
        "by_name": [IsAuthenticated],
        "stats": [AllowAny],
        "create": [IsAuthenticated],
        "update": [HasPermission(UserPermission.EDIT_TAGS)],
        "partial_update": [HasPermission(UserPermission.EDIT_TAGS)],
        "destroy": [HasPermission(UserPermission.EDIT_TAGS)],
        "merge": [HasPermission(UserPermission.EDIT_TAGS)],
    }

    serializer_class = LevelTagListingSerializer
    serializer_class_by_action = {
        "create": LevelTagDetailsSerializer,
        "update": LevelTagDetailsSerializer,
        "partial_update": LevelTagDetailsSerializer,
        "merge": LevelTagDetailsSerializer,
    }

    @action(detail=False)
    def by_name(self, request):
        name = request.GET.get("name")
        tag = self.queryset.filter(name__iexact=name).first()
        if not tag:
            raise Http404("No tag found with this name.")
        serializer = self.get_serializer(tag)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True)
    def stats(self, request, pk) -> Response:
        tags = (
            LevelTag.objects.exclude(id=pk)
            .annotate(
                level_count=Subquery(
                    Level.objects.filter(tags__id=pk)
                    .filter(
                        tags=OuterRef("id"),
                    )
                    .values("tags")
                    .annotate(count=Count("*"))
                    .values("count")
                )
            )
            .exclude(level_count=None)
        )

        return Response(
            LevelTagListingSerializer(instance=tags, many=True).data
        )

    @action(
        detail=True, methods=["post"], url_path=r"merge/(?P<target_pk>\d+)"
    )
    def merge(self, request, pk, target_pk) -> Response:
        source_tag = self.get_object()
        target_tag = self.queryset.filter(pk=target_pk).first()
        if not target_tag:
            raise Http404("Invalid target tag.")
        levels = (
            Level.objects.filter(tags__id=pk)
            .exclude(tags__id=target_pk)
            .values("id")
        )
        through_model_cls = Level.tags.through
        through_model_cls.objects.bulk_create(
            [
                through_model_cls(level_id=level["id"], leveltag_id=target_pk)
                for level in levels
            ]
        )
        source_tag.delete()
        return Response(
            LevelTagListingSerializer(instance=target_tag).data,
            status=status.HTTP_200_OK,
        )
