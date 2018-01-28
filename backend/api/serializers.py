from rest_framework import serializers

from django.db.models import Q, F, Sum, Case, When, IntegerField
from django.db.models.functions import Coalesce

from api import models

def get_columns():
    pass

class AccountSerializer(serializers.ModelSerializer):

    has_children = serializers.SerializerMethodField(read_only=True)

    def get_has_children(self, obj):
        return not obj.is_leaf_node()

    class Meta:
        model = models.Account
        fields = ('id', 'parent', 'name', 'code', 'has_children',
                        'account_level', 'is_loe')

class TransactionSerializer(serializers.ModelSerializer):

    class Meta:
        model = models.Transaction
        fields = ('paid', 'budget',)

class EmployeeSerializer(serializers.ModelSerializer):

    salaries = serializers.SerializerMethodField(read_only=True)

    def get_salaries(self, obj):

        range = ["2017-07-01", "2017-12-01"]
        pay_periods = models.PayPeriod.objects.filter(start_date__range=range)

        salaries = {}
        for pp in pay_periods:
            dmy = str(pp.start_date)
            (salary, virt) = models.EmployeeSalary.objects.get_salary(obj, pp)
            if salary is None:
                salaries[dmy] = { "salary": 0 }
            else:
                salaries[dmy] = { "salary": salary.total_ppay }
        return salaries

    class Meta:
        model = models.EmployeeTransactable
        fields = ('id', ',', 'salaries')

# TODO: Salary in a different dictionary?
class TransactableSerializer(serializers.ModelSerializer):

    payments = serializers.SerializerMethodField(read_only=False)

    account_type = serializers.SerializerMethodField(read_only=True)
    account_group = serializers.SerializerMethodField(read_only=True)
    account_sub_group = serializers.SerializerMethodField(read_only=True)
    account_class = serializers.SerializerMethodField(read_only=True)
    account_object = serializers.SerializerMethodField(read_only=True)
    account = serializers.SerializerMethodField(read_only=True)
    transactable = serializers.SerializerMethodField(read_only=True)

    def get_payments(self, transactable):
        range = [self.context['start_date'], self.context['end_date']]
        fund_id = self.context['fund']

        pay_periods = models.PayPeriod.objects.filter(start_date__range=range)
        payments_list = pay_periods.annotate(paid=Coalesce(Sum(Case(
            When(Q(**{"transaction__transactable": transactable}) &
                 Q(transaction__fund=fund_id),
            then=F('transaction__paid')), output_field=IntegerField())), 0))

        payments_dict = {}
        for payment in payments_list:
            period_date = payment.__dict__.pop('start_date')
            payments_dict[period_date] = payment.__dict__.pop('paid')
        return payments_dict

    def get_account_by_level(self, obj, account_level):
        account = obj.parent_account
        while account.parent != None and account.account_level != account_level:
            account = account.parent
        if account.account_level != account_level:
            return None
        return getattr(account, 'id', None)

    def get_account_type(self, obj):
        return self.get_account_by_level(obj, 'account_type')
    def get_account_group(self, obj):
        return self.get_account_by_level(obj, 'account_group')
    def get_account_sub_group(self, obj):
        return self.get_account_by_level(obj, 'account_sub_group')
    def get_account_class(self, obj):
        return self.get_account_by_level(obj, 'account_class')
    def get_account_object(self, obj):
        return self.get_account_by_level(obj, 'account_object')
    def get_account(self, obj):
        return self.get_account_by_level(obj, 'account')
    def get_transactable(self, obj):
        return obj.id

    class Meta:
        model = models.Transactable
        fields = ('id', 'name', 'code', 'payments', 'is_loe',
                        'account_level', #'is_employee',
                        'account_type',
                        'account_group',
                        'account_sub_group',
                        'account_class',
                        'account_object',
                        'account',
                        'transactable')
