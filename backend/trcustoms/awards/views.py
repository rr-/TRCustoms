from rest_framework.response import Response
from rest_framework.views import APIView

from trcustoms.awards.serializers import AwardSpecSerializer
from trcustoms.awards.specs import ALL_AWARD_SPECS


class AwardSpecListView(APIView):
    def get(self, request):
        serializer = AwardSpecSerializer(ALL_AWARD_SPECS, many=True)
        return Response(serializer.data)
