from django.core.exceptions import ObjectDoesNotExist
from django.db.models import F, Sum, Count
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import generics, viewsets, exceptions

from api import serializers, models

class EmployeeView(generics.ListAPIView):
    serializer_class = serializers.EmployeeSerializer
    queryset = models.Employee.objects.all()

class PaymentView(viewsets.ModelViewSet):
    serializer_class = serializers.PaymentSerializer

    def get_queryset(self):
        fund_id = self.request.query_params.get('fund_id')
        fund = None
        try:
            fund = models.Fund.objects.get(id=int(fund_id))
        except ObjectDoesNotExist:
            raise exceptions.NotFound(detail="Error: Fund not found for id: {}"
                    .format(fund_id), code=404)
        except (TypeError, ValueError):
            raise exceptions.NotFound(detail="Error: Invalid fund id given.",
                    code=404)

        transactions = models.Transaction.objects.filter(fund=fund)
        return transactions.annotate(date=F('pay_period__start_date')) \
                           .values('date', 'transactable', 'fund') \
                           .annotate(paid=Sum('paid'), budget=Sum('budget'))

# Summarizes payments based on the given parameters.
class PaymentSummaryView(generics.ListAPIView):
    serializer_class = serializers.PaymentSummarySerializer
    queryset = models.Transaction.objects.all() \
                           .annotate(date=F('pay_period__start_date')) \
                           .values('date', 'transactable') \
                           .annotate(paid=Sum('paid'), budget=Sum('budget'))

class FundList(generics.ListAPIView):
    serializer_class = serializers.FundSerializer
    queryset = models.Fund.objects.all()

class AccountHierarchyList(generics.ListAPIView):
    serializer_class = serializers.AccountHierarchySerializer
    queryset = models.AccountType.objects.all()

def range(serializer):
    try:
        range = [serializer.context['start_date'],
                 serializer.context['end_date']]
    except:
        return None
    pay_periods = models.PayPeriod.objects.filter(start_date__range=range)
    return [str(pp.start_date) for pp in pay_periods]

class AccountView(APIView):

    def get(self, request, parent_pk, format=None):
        accounts = serializers.AccountSerializer(
                    models.AccountBase.objects.filter(parent=parent_pk),
                    many=True
                ).data
        return Response(accounts)

class TransactableView(APIView):

    def get(self, request, format=None):
        # table_data = {}
        # context = {}

        # try:
            # print(request.query_params)
            # context = {
                # 'fund': request.query_params.get("fund"),
                # 'start_date': request.query_params.get("start_date"),
                # 'end_date': request.query_params.get("end_date"),
            # }
        # except:
            # return Response({"error": "Invalid params"})

        # # table_data['transactables'] = serializers.TransactableSerializer(
                # # models.Transactable.objects.all(),
                # # context=request.data, many=True).data
        # table_data['transactables'] = serializers.EmployeeTransactableSerializer(
                # models.Transactable.objects.filter(),
                # context=request.data, many=True).data
        # return Response(table_data)
        context = {}
        table_data = {}

        print(request.query_params)
        try:
            context = {
                'fund': request.query_params.get("fund"),
                'start_date': request.query_params.get("start_date"),
                'end_date': request.query_params.get("end_date"),
            }
        except:
            return Response({"error": "Invalid params"})

        serializer = serializers.TransactableSerializer(
                models.Transactable.objects.filter(
                    employee_transactable__isnull=False),
                context=context, many=True)
        table_data['transactables'] = serializer.data
        table_data['range'] = range(serializer)
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

