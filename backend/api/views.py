from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import generics

from api import serializers, models
# Create your views here.

def range(serializer):
    try:
        range = [serializer.context['start_date'],
                 serializer.context['end_date']]
    except:
        return None
    pay_periods = models.PayPeriod.objects.filter(start_date__range=range)
    return [str(pp.start_date) for pp in pay_periods]

class AccountView(APIView):
    renderer_classes = (JSONRenderer,)

    def get(self, request, parent_pk, format=None):
        accounts = serializers.AccountSerializer(
                    models.AccountBase.objects.filter(parent=parent_pk),
                    many=True
                ).data
        return Response(accounts)

class TransactableView(APIView):
    renderer_classes = (JSONRenderer,)

    def get(self, request, format=None):
        context = {}

        try:
            context = {
                fund: request.query_params.get("fund"),
                start_date: request.query_params.get("start_date"),
                end_date: request.query_params.get("end_date"),
            }
        except:
            return Response({"error": "Invalid params"})

        table_data['transactables'] = serializers.TransactableSerializer(
                models.Transactable.objects.all(),
                context=request.data, many=True).data
        return Response(table_data)

    def patch(self, request, format=None):
        context={}
        try:
            context = {
                'fund': request.query_params.get("fund"),
                'start_date': request.query_params.get("start_date"),
                'end_date': request.query_params.get("end_date"),
            }
        except:
            print("FAILURE")
            return Response({"error": "Invalid params"})

        serialized = serializers.TransactableSerializer(data=request.data,
                context=context)
        transactable = serialized.save()
        return Response(serializers.TransactableSerializer(transactable,
            context=context).data)

class EmployeeView(generics.ListAPIView):
    serializer_class = serializers.EmployeeSerializer
    queryset = models.Employee.objects.all()
    renderer_classes = (JSONRenderer,)

