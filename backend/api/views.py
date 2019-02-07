from django.core.exceptions import ObjectDoesNotExist
from django.db.models import F, Sum, Count, Max
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status, generics, viewsets, exceptions

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

# Operates similar to payment view, except each salary returned always refers
# to exactly one salary instance on the server side.
class SalaryView(viewsets.ModelViewSet):
    serializer_class = serializers.SalarySerializer
    def get_queryset(self):
        if self.request.query_params.get('employee', None) is not None:
            employee = int(self.request.query_params.get('employee', None))
            return models.EmployeeSalary.objects.all().filter(
                    employee=employee).order_by('pay_period')
        else:
            return models.EmployeeSalary.objects.all()

# If we ever need to view all the transactions made for employees / funds
# etc.
# TODO: Add SoftDelete functionality to make it so we can ignore certain 
#       transactions (once there exists an import with an overlapping range!)
class TransactionView(viewsets.ModelViewSet):
    serializer_class = serializers.TransactionSerializer

    def get_queryset(self):
        fund = None
        fund_id = self.request.query_params.get('fund')
        if fund_id is not None:
            fund = get_object_or_404(models.Fund.objects, id=fund_id)

        queryset = models.Transaction.objects.all()
        if fund is not None:
            return queryset.filter(fund=fund)
        else:
            return queryset

class FringeRateView(viewsets.ModelViewSet):
    serializer_class = serializers.FringeRateSerializer
    queryset = models.FringeRate.objects.all()

class IndirectRateView(viewsets.ModelViewSet):
    serializer_class = serializers.IndirectRateSerializer
    queryset = models.IndirectRate.objects.all()

# Summarizes payments based on the given parameters.
class PaymentSummaryView(generics.ListAPIView):
    serializer_class = serializers.PaymentSummarySerializer
    queryset = models.Transaction.objects.all() \
                           .annotate(date=F('pay_period')) \
                           .values('date', 'transactable') \
                           .annotate(paid=Sum('paid'), budget=Sum('budget'),
                                     num_transactions=Count('id'),
                                     updated_on=Max('updated_on'))

# Aggregates spending by fund and pay_period.
class FundSummaryView(generics.ListAPIView):
    serializer_class = serializers.PaymentSummarySerializer
    queryset = models.Transaction.objects.all() \
                           .annotate(date=F('pay_period')) \
                           .values('date', 'fund') \
                           .annotate(paid=Sum('paid'), budget=Sum('budget'),
                                     num_transactions=Count('id'))

# Displays information on all employees where a matching transactable was found.
class EmployeeView(generics.ListAPIView):
    serializer_class = serializers.EmployeeSerializer
    queryset = models.EmployeeTransactable.objects.all()

class FundList(generics.ListAPIView):
    serializer_class = serializers.FundSerializer
    queryset = models.Fund.objects.all()

# FIXME: Make a uniform API which has method "import_file" internally using xlrd
import xlrd
from api.management.commands.import_transactions import TransactionsFileHandler
from api.management.commands.import_salaries import SalaryFileHandler

# Stores the file internally.
class TransactionFileView(viewsets.ModelViewSet):
    parser_classes = (MultiPartParser, FormParser)
    serializer_class = serializers.TransactionFileSerializer

    def create(self, request, *args, **kwargs):
        file_serializer = serializers.TransactionFileSerializer(data=request.data)
        if file_serializer.is_valid():
            file_instance = file_serializer.save()

            wb = xlrd.open_workbook(file_serializer.data['file'])
            ws = wb.sheet_by_index(0)
            TransactionsFileHandler(ws, file_instance).import_file()

            return Response(file_serializer.data, status=status.HTTP_201_CREATED)
        else:
            print(file_serializer.errors)
            return Response(file_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get_queryset(self):
        return models.TransactionFile.objects.all()

class SalaryFileView(viewsets.ModelViewSet):
    parser_classes = (MultiPartParser, FormParser)
    serializer_class = serializers.SalaryFileSerializer

    def create(self, request, *args, **kwargs):
        file_serializer = serializers.SalaryFileSerializer(data=request.data)
        if file_serializer.is_valid():
            file_instance = file_serializer.save()
            wb = xlrd.open_workbook(file_serializer.data['file'])
            SalaryFileHandler(file_instance.pay_period).import_file(wb)
            return Response(file_serializer.data, status=status.HTTP_201_CREATED)
        else:
            print(file_serializer.errors)
            return Response(file_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get_queryset(self):
        return models.SalaryFile.objects.all()

from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page

class AccountList(generics.ListAPIView):
    serializer_class = serializers.AccountBaseSerializer
    queryset = models.AccountBase.objects.all().select_subclasses()

    @method_decorator(cache_page(6000))
    def dispatch(self, *args, **kwargs):
        return super(AccountList, self).dispatch(*args, **kwargs)

# This stores config data structures
class UserSettingsView(viewsets.ModelViewSet):
    serializer_class = serializers.UserSettingsSerializer
    queryset = models.UserSettings.objects.all()

