from django.db import transaction
from django.db.models import ExpressionWrapper, F, IntegerField, Q
from django.http import Http404
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.generics import get_object_or_404
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from trcustoms.mixins import (
    AuditLogModelWatcherMixin,
    MultiSerializerMixin,
    PermissionsMixin,
)
from trcustoms.permissions import (
    AllowNone,
    HasPermission,
    IsAccessingOwnResource,
    has_permission,
)
from trcustoms.reviews.logic import (
    MAX_REVIEW_VOTES_PER_LEVEL,
    can_user_vote_on_review,
    get_user_review_vote_count_for_level,
    update_review_vote_counts,
)
from trcustoms.reviews.models import Review, ReviewVote
from trcustoms.reviews.serializers import (
    ReviewDetailsSerializer,
    ReviewHideSerializer,
    ReviewListingSerializer,
    ReviewVoteSerializer,
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
    queryset = Review.objects.annotate(
        score=ExpressionWrapper(
            F("upvote_count") - F("downvote_count"),
            output_field=IntegerField(),
        )
    ).prefetch_related(
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
        "score",
    ]

    permission_classes = [AllowNone]
    permission_classes_by_action = {
        "retrieve": [AllowAny],
        "list": [AllowAny],
        "create": [IsAuthenticated],
        "vote": [IsAuthenticated],
        "destroy": [HasPermission(UserPermission.DELETE_REVIEWS)],
        "hide": [HasPermission(UserPermission.EDIT_REVIEWS)],
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
        "hide": ReviewHideSerializer,
        "vote": ReviewVoteSerializer,
    }

    def get_object(self):
        auth_user = self.request.user
        try:
            obj = get_object_or_404(self.get_queryset(), pk=self.kwargs["pk"])
        except Http404:
            if not (
                has_permission(auth_user, UserPermission.EDIT_REVIEWS)
                or has_permission(auth_user, UserPermission.DELETE_REVIEWS)
            ):
                raise
            obj = get_object_or_404(self.queryset, pk=self.kwargs["pk"])
        self.check_object_permissions(self.request, obj)
        return obj

    def get_queryset(self):
        queryset = super().get_queryset()
        auth_user = self.request.user

        if author_ids := parse_ints(self.request.query_params.get("authors")):
            for author_id in author_ids:
                queryset = queryset.filter(author_id=author_id)

        if level_ids := parse_ints(self.request.query_params.get("levels")):
            for level_id in level_ids:
                queryset = queryset.filter(level_id=level_id)

        if not has_permission(auth_user, UserPermission.EDIT_REVIEWS):
            queryset = queryset.filter(
                Q(is_hidden=False)
                | (
                    Q(author=auth_user)
                    if (auth_user and not auth_user.is_anonymous)
                    else Q()
                )
            )

        return queryset

    @action(detail=True, methods=["post"])
    def vote(self, request, pk: int) -> Response:
        review = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        if not can_user_vote_on_review(user, review):
            return Response(
                {"detail": "You cannot vote on this review."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        requested_vote = int(serializer.validated_data["vote"])

        with transaction.atomic():
            existing_vote = (
                ReviewVote.objects.select_for_update()
                .filter(
                    review=review,
                    user=user,
                )
                .first()
            )
            current_vote_count = get_user_review_vote_count_for_level(
                user,
                review.level,
            )

            if existing_vote and existing_vote.vote == requested_vote:
                existing_vote.delete()
            else:
                if (
                    not existing_vote
                    and current_vote_count >= MAX_REVIEW_VOTES_PER_LEVEL
                ):
                    return Response(
                        {
                            "detail": (
                                "You can only vote on 3 reviews per level."
                            )
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                ReviewVote.objects.update_or_create(
                    review=review,
                    user=user,
                    defaults={"vote": requested_vote},
                )

        update_review_vote_counts(review)
        review.refresh_from_db()
        response_serializer = ReviewListingSerializer(
            review,
            context=self.get_serializer_context(),
        )
        return Response(response_serializer.data)

    @action(detail=True, methods=["post"])
    def hide(self, request, pk: int) -> Response:
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        review = self.get_object()
        serializer.notify(review)
        return Response({})
