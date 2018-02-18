from django.core.exceptions import ObjectDoesNotExist
from django.db.models import F, Sum, Count
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import generics, viewsets, exceptions

from api import serializers, models

def get_object_or_404(queryset, **kwargs):
    obj = None
    try:
        obj = queryset.get(**kwargs)
    except ObjectDoesNotExist:
        raise exceptions.NotFound(
                detail="ERROR: Object not found args: {}"
                .format([key for key in kwargs]), code=404)
    except (TypeError, ValueError):
        raise exceptions.NotFound(
                detail="ERROR: Invalid or malformed arguments given.",
                code=404)
    return obj

class PaymentView(viewsets.ModelViewSet):
    serializer_class = serializers.PaymentSerializer

    def get_queryset(self):
        fund = None
        fund_id = self.request.query_params.get('fund')
        if fund_id is not None:
            fund = get_object_or_404(models.Fund.objects, id=fund_id)

        if fund is not None:
            transactions = models.Transaction.objects.filter(fund=fund)
        else:
            transactions = models.Transaction.objects.all()
        return transactions.annotate(date=F('pay_period__start_date')) \
                           .values('date', 'transactable', 'fund') \
                           .annotate(paid=Sum('paid'), budget=Sum('budget'),
                            num_transactions=Count('id'))

    def create(self, request):
        serializer = serializers.TransactionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    # Pulled from the drf repo, with modified to access a different query.
    def get_object(self):
        queryset = models.Transaction.objects.all()

        # Perform the lookup filtering.
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field

        assert lookup_url_kwarg in self.kwargs, (
            'Expected view %s to be called with a URL keyword argument '
            'named "%s". Fix your URL conf, or set the `.lookup_field` '
            'attribute on the view correctly.' %
            (self.__class__.__name__, lookup_url_kwarg)
        )

        filter_kwargs = {self.lookup_field: self.kwargs[lookup_url_kwarg]}
        obj = generics.get_object_or_404(queryset, **filter_kwargs)

        # May raise a permission denied
        self.check_object_permissions(self.request, obj)
        return obj

# Operates similar to payment view, except each salary returned always refers
# to exactly one salary instance on the server side.
class SalaryView(viewsets.ModelViewSet):
    serializer_class = serializers.SalarySerializer
    queryset = models.EmployeeSalary.objects.all()

# If we ever need to view all the transactions made for employees / funds
# etc.
class TransactionView(viewsets.ModelViewSet):
    serializer_class = serializers.TransactionSerializer

    def get_queryset(self):
        fund = None
        fund_id = self.request.query_params.get('fund')
        if fund_id is not None:
            fund = get_object_or_404(models.Fund.objects, id=fund_id)

        if fund is not None:
            return models.Transaction.objects.filter(fund=fund)
        else:
            return models.Transaction.objects.all()

# Summarizes payments based on the given parameters.
class PaymentSummaryView(generics.ListAPIView):
    serializer_class = serializers.PaymentSummarySerializer
    queryset = models.Transaction.objects.all() \
                           .annotate(date=F('pay_period__start_date')) \
                           .values('date', 'transactable') \
                           .annotate(paid=Sum('paid'), budget=Sum('budget'),
                                     num_transactions=Count('id'))

# Aggregates spending by fund and pay_period.
class FundSummaryView(generics.ListAPIView):
    serializer_class = serializers.PaymentSummarySerializer
    queryset = models.Transaction.objects.all() \
                           .annotate(date=F('pay_period__start_date')) \
                           .values('date', 'fund') \
                           .annotate(paid=Sum('paid'), budget=Sum('budget'),
                                     num_transactions=Count('id'))

class EmployeeView(generics.ListAPIView):
    serializer_class = serializers.EmployeeSerializer
    queryset = models.Employee.objects.all()

class FundList(generics.ListAPIView):
    serializer_class = serializers.FundSerializer
    queryset = models.Fund.objects.all()

class AccountList(generics.ListAPIView):
    serializer_class = serializers.AccountSerializer
    queryset = models.AccountBase.objects.all()

class AccountHierarchyList(generics.ListAPIView):
    serializer_class = serializers.AccountHierarchySerializer
    def get_queryset(self):
        return models.AccountBase.objects.get_cached_trees()

def range(serializer):
    try:
        range = [serializer.context['start_date'],
                 serializer.context['end_date']]
    except:
        return None
    pay_periods = models.PayPeriod.objects.filter(start_date__range=range)
    return [str(pp.start_date) for pp in pay_periods]
class TransactableView(APIView):
    def get(self, request, format=None):
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
        serializer = serializers.OldTransactableSerializer(
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
        serialized = serializers.OldTransactableSerializer(data=request.data,
                context=context)
        transactable = serialized.save()
        return Response(serializers.OldTransactableSerializer(transactable,
            context=context).data)

