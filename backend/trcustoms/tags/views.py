from django.db.models import Count, OuterRef, Subquery
from django.http import Http404
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from trcustoms.audit_logs.utils import track_model_update
from trcustoms.levels.models import Level
from trcustoms.mixins import (
    AuditLogModelWatcherMixin,
    MultiSerializerMixin,
    PermissionsMixin,
)
from trcustoms.permissions import AllowNone, HasPermission
from trcustoms.tags.models import Tag
from trcustoms.tags.serializers import (
    TagDetailsSerializer,
    TagListingSerializer,
)
from trcustoms.users.models import UserPermission


class TagViewSet(
    AuditLogModelWatcherMixin,
    PermissionsMixin,
    MultiSerializerMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = Tag.objects.with_counts()
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

    serializer_class = TagListingSerializer
    serializer_class_by_action = {
        "create": TagDetailsSerializer,
        "update": TagDetailsSerializer,
        "partial_update": TagDetailsSerializer,
        "merge": TagDetailsSerializer,
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
            Tag.objects.exclude(id=pk)
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

        return Response(TagListingSerializer(instance=tags, many=True).data)

    @action(
        detail=True, methods=["post"], url_path=r"merge/(?P<target_pk>\d+)"
    )
    def merge(self, request, pk, target_pk) -> Response:
        source_tag = self.get_object()
        target_tag = self.queryset.filter(pk=target_pk).first()
        if not target_tag:
            raise Http404("Invalid target tag.")
        with track_model_update(
            obj=source_tag,
            request=request,
            changes=[f"Merged to {target_tag.name}"],
        ):
            levels = (
                Level.objects.filter(tags__id=pk)
                .exclude(tags__id=target_pk)
                .values("id")
            )
            through_model_cls = Level.tags.through
            through_model_cls.objects.bulk_create(
                [
                    through_model_cls(level_id=level["id"], tag_id=target_pk)
                    for level in levels
                ]
            )
        source_tag.delete()
        return Response(
            TagListingSerializer(instance=target_tag).data,
            status=status.HTTP_200_OK,
        )
