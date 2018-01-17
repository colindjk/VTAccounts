from rest_framework import serializers

from django.db.models import Q, F, Sum, Case, When, IntegerField
from django.db.models.functions import Coalesce

from api import models

class TransactionSummarySerializer(serializers.ModelSerializer):

    payments = serializers.DictField()

    def set_payments(self, transactable, kwargs):
        tactions = transactable.transaction_set
        periods = models.PayPeriod.objects.filter(start_date__range=
                                        [self.context['start_date'],
                                         self.context['end_date']])
        payments = self.payments_query(periods, transactable)

        payments_dict = {}
        for payment in payments:
            payment.__dict__.pop('_state')
            period_date = payment.__dict__.pop('start_date')
            payments_dict[period_date] = payment.__dict__
        transactable.payments = payments_dict

    @property
    def payments_range(self):
        return [self.context['start_date'], self.context['end_date']] 

    def initialize_payments(self):
        kwargs = {}
        if self.context.get('fund', None) is not None:
            kwargs['fund'] = models.Fund.objects.get(id=self.context['fund'])
        kwargs['pay_period__start_date__range'] = [self.context['start_date'],
                                                   self.context['end_date']]
        # try:
        for account in self.instance:
            self.set_payments(account, kwargs)
        # except Exception as e:
            # print "Could not iterate accounts with exception: " + str(e)
            # print self.instance
            # self.set_payments(self.instance, kwargs)

    def payments_query(self, pay_periods, object):
        raise NotImplementedError

    def __init__(self, *args, **kwargs):
        super(TransactableSerializer, self).__init__(*args , **kwargs)
        self.initialize_payments()

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

    def get_payments(self, obj):
        range = [self.context['start_date'], self.context['end_date']]
        fund_id = self.context['fund']
        
        transactions = obj.transactions.filter(
                range=pay_period__start_date__range, fund=fund_id)
        payments = {}
        default_payment = {
                'paid': 0,
        }

        for pay_period in models.PayPeriod.objects.filter(
                                 start_date__range=range):
            transaction = transactions.filter(pay_period=pay_period).first()
            if transaction is None:
                payments[pay_period.start_date] = default_payment
                continue
            payment = { 'paid': transaction.paid }

            # payments[pay_period.start_date] = 

    def get_account_type(self, obj):
        account = obj.account
        while account.parent != None and account.account_level != 'account_type':
            account = account.parent
        if account.account_level != 'account_type':
            return None
        return getattr(account, 'id', None)

    def get_account_group(self, obj):
        account = obj.account_parent
        while account.parent != None and account.account_level != 'account_group':
            account = account.parent
        if account.account_level != 'account_group':
            return None
        return getattr(account, 'id', None)

    def get_account_sub_group(self, obj):
        account = obj.account_parent
        while account.parent != None and account.account_level != 'account_sub_group':
            account = account.parent
        if account.account_level != 'account_sub_group':
            return None
        return getattr(account, 'id', None)

    def get_account_class(self, obj):
        account = obj.account_parent
        while account.parent != None and account.account_level != 'account_class':
            account = account.parent
        if account.account_level != 'account_class':
            return None
        return getattr(account, 'id', None)

    def get_account_object(self, obj):
        account = obj.account_parent
        while account.parent != None and account.account_level != 'account_object':
            account = account.parent
        if account.account_level != 'account_object':
            return None
        return getattr(account, 'id', None)

    def get_account(self, obj):
        account = obj.account_parent
        while account.parent != None and account.account_level != 'account':
            account = account.parent
        if account.account_level != 'account':
            return None
        return getattr(account, 'id', None)

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

