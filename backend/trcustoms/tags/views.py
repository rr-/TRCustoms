from django.db.models import Count, OuterRef, Subquery
from django.http import Http404
from drf_spectacular.utils import extend_schema
from rest_framework import generics, serializers, status
from rest_framework.generics import get_object_or_404
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from trcustoms.common.serializers import EmptySerializer
from trcustoms.levels.models import Level
from trcustoms.mixins import AuditLogModelWatcherMixin
from trcustoms.permissions import AllowReadOnly, HasPermission
from trcustoms.tags.logic import merge_tags
from trcustoms.tags.models import Tag
from trcustoms.tags.serializers import (
    TagDetailsSerializer,
    TagListingSerializer,
    TagMergeSerializer,
)
from trcustoms.users.models import UserPermission


class TagListView(
    AuditLogModelWatcherMixin,
    generics.ListCreateAPIView,
):
    queryset = Tag.objects.with_counts()
    search_fields = ["name"]
    ordering_fields = ["name", "level_count", "created", "last_updated"]
    permission_classes = [AllowReadOnly | IsAuthenticated]

    def get_serializer_class(self) -> serializers.Serializer:
        if self.request.method == "GET":
            return TagListingSerializer
        return TagDetailsSerializer


class TagDetailView(
    AuditLogModelWatcherMixin,
    generics.RetrieveUpdateDestroyAPIView,
):
    queryset = Tag.objects.with_counts()
    permission_classes = [
        AllowReadOnly | HasPermission(UserPermission.EDIT_TAGS)
    ]

    def get_serializer_class(self) -> serializers.Serializer:
        return {
            "GET": TagListingSerializer,
            "DELETE": EmptySerializer,
        }.get(self.request.method, TagDetailsSerializer)


class TagRetrieveByNameView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = TagDetailsSerializer
    lookup_field = "name"

    def get_object(self):
        return get_object_or_404(
            Tag.objects.with_counts().filter(
                **{
                    f"{self.lookup_field}__iexact": self.kwargs[
                        self.lookup_field
                    ]
                }
            )
        )


class TagMergeView(generics.CreateAPIView):
    queryset = Tag.objects.with_counts()
    permission_classes = [HasPermission(UserPermission.EDIT_TAGS)]

    @extend_schema(
        request=TagMergeSerializer,
        responses={status.HTTP_200_OK: TagDetailsSerializer},
    )
    def post(self, request, pk) -> Response:
        serializer = TagMergeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        target_pk = serializer.data["target_tag_id"]
        source_tag = self.get_object()
        target_tag = self.queryset.filter(pk=target_pk).first()
        try:
            merge_tags(source_tag.name, target_tag.name, request)
        except Tag.DoesNotExist:
            raise Http404("Invalid tag.") from None
        serializer = TagDetailsSerializer(
            instance=Tag.objects.with_counts().get(pk=target_tag.pk)
        )
        return Response(serializer.data, status=status.HTTP_200_OK)


class TagStatsView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = TagListingSerializer
    pagination_class = None

    def get_queryset(self):
        pk = self.kwargs["pk"]
        return (
            Tag.objects.exclude(pk=pk)
            .annotate(
                level_count=Subquery(
                    Level.objects.filter(tags__pk=pk)
                    .filter(
                        tags=OuterRef("pk"),
                    )
                    .values("tags")
                    .annotate(count=Count("*"))
                    .values("count")
                )
            )
            .exclude(level_count=None)
        )
