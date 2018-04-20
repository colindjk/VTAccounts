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

# Revision 
# Operates similar to payment view, except each salary returned always refers
# to exactly one salary instance on the server side.
class SalaryView(viewsets.ModelViewSet):
    serializer_class = serializers.SalarySerializer
    def get_queryset(self):
        if self.request.query_params.get('employee', None) is not None:
            employee = int(self.request.query_params.get('employee', None))
            return models.EmployeeSalary.objects.all().filter(
                    employee=employee).order_by('pay_period__start_date')
        else:
            return models.EmployeeSalary.objects.all()

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
    queryset = models.EmployeeTransactable.objects.all()

class FundList(generics.ListAPIView):
    serializer_class = serializers.FundSerializer
    queryset = models.Fund.objects.all()

# Can take only the file as input,
# Optional Params: Fund, 
# class TransactionUploadView(APIView):
    # parser_classes = (FileUploadParser,)

    # def put(self, request, filename, format=None):
        # file_obj = request.FILES['file']
        # # do some stuff with uploaded file
        # return Response(status=204)

from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page

class AccountList(generics.ListAPIView):
    serializer_class = serializers.AccountSerializer
    queryset = models.AccountBase.objects.all()

    @method_decorator(cache_page(6000))
    def dispatch(self, *args, **kwargs):
        return super(AccountList, self).dispatch(*args, **kwargs)

class AccountHierarchyList(generics.ListAPIView):
    serializer_class = serializers.AccountHierarchySerializer
    def get_queryset(self):
        return models.AccountBase.objects.get_cached_trees()

