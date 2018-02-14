from rest_framework import serializers, validators

from django.db.models import Q, F, Sum, Case, When, IntegerField
from django.db.models.functions import Coalesce

from api import models

class TransactableSerializer(serializers.ModelSerializer):

    account_type = serializers.SerializerMethodField(read_only=True)
    account_group = serializers.SerializerMethodField(read_only=True)
    account_sub_group = serializers.SerializerMethodField(read_only=True)
    account_class = serializers.SerializerMethodField(read_only=True)
    account_object = serializers.SerializerMethodField(read_only=True)
    account = serializers.SerializerMethodField(read_only=True)

    def get_account_by_level(self, account, account_level):

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
        return self.get_account_by_level(obj, 'transactable')

    class Meta:
        model = models.Transactable
        fields = ('id', 'name', 'code', 'account_level', 'children',
                'account_type', 'account_group', 'account_sub_group',
                'account_class', 'account_object', 'account',)

# Tree hierarchy is generated by recursively defining the class. 
# The users will aggregate values recursively for summary purposes.
class AccountHierarchySerializer(serializers.ModelSerializer):

    def to_representation(self, value):
        if value.account_level == 'transactable':
            value = value.into_account()
            return TransactableSerializer(value).to_representation(value)
        return super(AccountHierarchySerializer, self).to_representation(value)

    class Meta:
        model = models.AccountBase
        fields = ('id', 'name', 'code', 'children', 'account_level',)

AccountHierarchySerializer._declared_fields['children'] = \
        AccountHierarchySerializer(many=True, source='_cached_children')

class EmployeeSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)
    pid = serializers.IntegerField()

    class Meta:
        model = models.EmployeeTransactable
        fields = ('first_name', 'last_name', 'pid', 'position_number',
                'transactable')

class FundSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Fund
        fields = ('id', 'name', 'code', 'budget', 'verified')

class EmployeeTransactableSerializer(serializers.ModelSerializer):

    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)
    pid = serializers.IntegerField()
    salaries = serializers.SerializerMethodField(read_only=True)

    def save(self):
        data = self.initial_data
        employee_transactable = models.EmployeeTransactable(
                id=self.initial_data['id'],
        )
        salaries = self.initial_data['salaries']
        for day in salaries:
            if salaries[day]["isVirtual"]:
                continue
            amount = 0
            try:
                amount = float(salaries[day]["salary"])
            except:
                amount = 0
            pp = models.PayPeriod.objects.get(start_date=day)
            models.EmployeeSalary.objects.update_salary(
                        employee_transactable, pp, amount)
        # return employee_transactable.save()
        return employee_transactable

    def get_salaries(self, employee_transactable):
        range = None
        fund_id = None
        try:
            range = [self.context['start_date'], self.context['end_date']]
            fund_id = self.context['fund']
        except:
            return None
        pay_periods = models.PayPeriod.objects.filter(start_date__range=range)
        salaries = {}
        for pay_period in pay_periods:
            total_ppay = 0
            (salary, is_virtual) = models.EmployeeSalary.objects.get_salary(
                    employee_transactable, pay_period)
            if salary is not None: total_ppay = salary.total_ppay
            
            salaries[str(pay_period.start_date)] = {
                    'salary': total_ppay,
                    'isVirtual': is_virtual,
            }
        return salaries

    class Meta:
        model = models.EmployeeTransactable
        fields = ('id', 'first_name', 'last_name', 'position_number',
                'pid', 'salaries')

# TODO: This will be the AccounSerializer!!!!!!!
class OldTransactableSerializer(serializers.ModelSerializer):

    # Retrieves employee via reverse relation
    employee_transactable = EmployeeTransactableSerializer(required=False)
    payments = serializers.SerializerMethodField(read_only=False)

    account_type = serializers.SerializerMethodField(read_only=True)
    account_group = serializers.SerializerMethodField(read_only=True)
    account_sub_group = serializers.SerializerMethodField(read_only=True)
    account_class = serializers.SerializerMethodField(read_only=True)
    account_object = serializers.SerializerMethodField(read_only=True)
    account = serializers.SerializerMethodField(read_only=True)
    transactable = serializers.SerializerMethodField(read_only=True)

    # TODO: Editable future transactions
    def save(self):
        print(self.context)
        data = self.initial_data
        transactable = models.Transactable.objects.get(
                id=self.initial_data['id'])
        employee_transactable = EmployeeTransactableSerializer(data=
                self.initial_data['employee_transactable'], context=self.context
                ).save()

        return models.Transactable.objects.get(id=self.initial_data['id'])

    def get_payments(self, transactable):
        range = None
        fund_id = None
        try:
            range = [self.context['start_date'], self.context['end_date']]
            fund_id = self.context['fund']
        except:
            return None

        pay_periods = models.PayPeriod.objects.filter(start_date__range=range)
        payments_list = pay_periods.annotate(paid=Coalesce(Sum(Case(
            When(Q(**{"transaction__transactable": transactable}) &
                 Q(transaction__fund=fund_id),
            then=F('transaction__paid')), output_field=IntegerField())), 0))

        payments_dict = {}
        for payment in payments_list:
            period_date = str(payment.__dict__.pop('start_date'))
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
        fields = ('id', 'name', # 'code',
                        'payments', 'is_loe',
                        'employee_transactable',
                        'account_type',
                        'account_group',
                        'account_sub_group',
                        'account_class',
                        'account_object',
                        'account',
                        'transactable')

# Field class which allows for a representation of a foreign field to be the id
class ForeignKeyField(serializers.PrimaryKeyRelatedField):
    # `value` is just an id.
    def to_representation(self, value):
        if self.pk_field is not None:
            return self.pk_field.to_representation(value)
        return value

class SalarySerializer(serializers.ModelSerializer):
    date = serializers.DateField(format='iso-8601',
            source='pay_period.start_date')
    pay_period = ForeignKeyField(write_only=True,
            queryset=models.PayPeriod.objects.all())

    # Copies given data b/c post request data is immutable.
    def to_internal_value(self, data):
        data = data.copy()
        print(data)
        dmy = data['date']
        data['pay_period'] = models.PayPeriod.objects.get(start_date=dmy).id
        return super(SalarySerializer, self).to_internal_value(data)

    class Meta:
        model = models.EmployeeSalary
        fields = ('id', 'total_ppay', 'employee', 'date', 'pay_period')

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Transaction
        fields = ('id', 'transactable', 'paid', 'budget')
        validators = [
            validators.UniqueTogetherValidator(
                    queryset=models.Transaction.objects.all(),
                    fields=('fund', 'transactable', 'pay_period')
            ),
        ]

# This will get a summary of transactions, where the unique identifier is a
# triple field => { fund, transactable, pay_period }
# By using the PayPeriod class as the model, we make it so that a payment is
# returned for each pay period that exists in a given range, regardless of
# whether any transactions actually exist (yet).
class PaymentSerializer(serializers.ModelSerializer):
    # Include only when there exists exactly ONE transaction, for editing.
    id = serializers.IntegerField(required=False)

    # Unique identifiers
    date = serializers.DateField(format='iso-8601', read_only=True)
    fund = ForeignKeyField(queryset=models.Fund.objects)
    transactable = ForeignKeyField(queryset=models.Transactable.objects)

    # This is used when processing a CREATE request, see Meta.validators
    pay_period = ForeignKeyField(write_only=True,
            queryset=models.PayPeriod.objects.all())

    # Aggregated fields
    paid = serializers.FloatField()
    budget = serializers.FloatField()
    num_transactions = serializers.IntegerField(read_only=True)

    def to_internal_value(self, data):
        data = data.copy()
        dmy = data['date']
        data['pay_period'] = models.PayPeriod.objects.get(start_date=dmy).id
        return super(PaymentSerializer, self).to_internal_value(data)

    def to_representation(self, data):
        if isinstance(data, models.Transaction):
            return TransactionSerializer(data).to_representation(data)
        if data['num_transactions'] == 1:
            data['id'] = models.Transaction.objects.get(
                    pay_period__start_date=data['date'], fund=data['fund'],
                    transactable=data['transactable']).id
        return super(PaymentSerializer, self).to_representation(data)

    class Meta:
        model = models.Transaction
        fields = ('id', 'date', 'pay_period', 'fund', 'transactable',
                  'paid', 'budget', 'num_transactions')
        validators = [
            validators.UniqueTogetherValidator(
                    queryset=models.Transaction.objects.all(),
                    fields=('fund', 'transactable', 'pay_period')
            ),
        ]

# Read-Only serializer for getting summaries based on different fields.
class PaymentSummarySerializer(serializers.ModelSerializer):
    # Unique identifiers
    date = serializers.DateField(required=False)
    fund = serializers.IntegerField(required=False)
    transactable = serializers.IntegerField(required=False)

    # Aggregated fields
    paid = serializers.FloatField()
    budget = serializers.FloatField()

    class Meta:
        model = models.Transaction
        fields = ('date', 'fund', 'transactable', 'paid', 'budget')
        read_only_fields = ('date', 'fund', 'transactable', 'paid', 'budget')


