from rest_framework import generics
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from trcustoms.awards.models import UserAward
from trcustoms.awards.serializers import (
    AwardRecipientSerializer,
    AwardSpecSerializer,
)
from trcustoms.awards.specs import ALL_AWARD_SPECS


class AwardSpecListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        serializer = AwardSpecSerializer(ALL_AWARD_SPECS, many=True)
        return Response(serializer.data)


class AwardRecipientListView(generics.ListAPIView):
    """
    API view to list users who received a given award (by code and optional
    tier), with pagination.
    """

    permission_classes = [AllowAny]
    serializer_class = AwardRecipientSerializer

    def get_queryset(self):
        code = self.kwargs.get("code")
        tier = self.request.query_params.get("tier")
        qs = UserAward.objects.filter(code=code)
        if tier is not None:
            try:
                qs = qs.filter(tier=int(tier))
            except (TypeError, ValueError) as ex:
                raise ValidationError(
                    {"detail": "Invalid tier parameter"}
                ) from ex
        return qs.order_by("-created")
