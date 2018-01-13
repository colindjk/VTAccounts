from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response
from rest_framework.views import APIView

from api import serializers, models
# Create your views here.

class AccountView(APIView):
    renderer_classes = (JSONRenderer,)
    def get(self, request, format=None):
        table_data = {}
        serializers.AccountSerializer()
        return Response()

class FundByAccountView(APIView):
    renderer_classes = (JSONRenderer,)

    def get(self, request, format=None):
        table_data = {}
        context = { "fund": 1,
                    "start_date": "2016-12-01",
                    "end_date": "2017-09-01" }
        table_data['rows'] = serializers.AccountSerializer(
                models.AccountType.objects.all(), many=True).data
        table_data['extra'] = serializers.TransactableSerializer(
                                 models.Transactable.objects.all(),
                                 context=context, many=True).data
        return Response(table_data)

