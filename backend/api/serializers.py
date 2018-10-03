from rest_framework import serializers, validators

from django.db.models import Q, F, Sum, Case, When, IntegerField
from django.db.models.functions import Coalesce

import time

from api import models

# Field class which allows for a representation of a foreign field to be the id
class ForeignKeyField(serializers.PrimaryKeyRelatedField):
    # `value` is just an id.
    def to_representation(self, value):
        if self.pk_field is not None:
            return self.pk_field.to_representation(value)
        return value

# Used to convert 'updated_on' to integer to allow frontend to determine most
# recent transactions.
class TimestampField(serializers.Field):
    def to_representation(self, value):
        return int(time.mktime(value.timetuple()))

class TransactableSerializer(serializers.ModelSerializer):

    employee = serializers.IntegerField(required=False,
            source='employee_transactable__id')

    class Meta:
        model = models.Transactable
        fields = ('id', 'name', 'code', 'account_level', 'children',
                'parent', 'employee')

# Tree hierarchy is generated by recursively defining the class. 
# The users will aggregate values recursively for summary purposes.
class AccountHierarchySerializer(serializers.ModelSerializer):

    def to_representation(self, value):
        # Provide a reference to the employee
        if value.account_level == 'transactable':
            value = value.into_account()
            return TransactableSerializer(value).to_representation(value)
        return super(AccountHierarchySerializer, self).to_representation(value)

    class Meta:
        model = models.AccountBase
        fields = ('id', 'name', 'code', 'children', 'account_level',)

AccountHierarchySerializer._declared_fields['children'] = \
        AccountHierarchySerializer(many=True, source='_cached_children')

# Tree hierarchy is generated by recursively defining the class. 
# The users will aggregate values recursively for summary purposes.
class AccountSerializer(serializers.ModelSerializer):

    def to_representation(self, value):
        if value.account_level == 'transactable':
            value = value.into_account()
            return TransactableSerializer(value).to_representation(value)
        return super(AccountSerializer, self).to_representation(value)

    class Meta:
        model = models.AccountBase
        fields = ('id', 'name', 'code', 'parent', 'children', 'account_level',)

class EmployeeSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)
    pid = serializers.IntegerField()
    updated_on = TimestampField(read_only=True)

    class Meta:
        model = models.EmployeeTransactable
        fields = ('id', 'first_name', 'last_name', 'pid', 'position_number',
                'transactable', 'updated_on')
        read_only_fields = ('updated_on',)

class FundSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Fund
        fields = ('id', 'name', 'code', 'budget', 'verified')

# When serializing a queryset of salaries, the salaries should be ordered
# by the `start_date` field. 
class SalarySerializer(serializers.ModelSerializer):
    date = serializers.DateField(format='iso-8601',
            source='pay_period.start_date')
    pay_period = ForeignKeyField(write_only=True,
            queryset=models.PayPeriod.objects.all())
    updated_on = TimestampField(read_only=True)

    # Copies given data b/c post request data is immutable.
    def to_internal_value(self, data):
        data = data.copy()
        dmy = data['date']
        data['pay_period'] = models.PayPeriod.objects.get(start_date=dmy).id
        return super(SalarySerializer, self).to_internal_value(data)

    class Meta:
        model = models.EmployeeSalary
        fields = ('id', 'total_ppay', 'employee', 'date', 'pay_period', 'updated_on')

class SalaryFileSerializer(serializers.ModelSerializer):
    date = serializers.DateField(format='iso-8601',
            source='pay_period.start_date')
    pay_period = ForeignKeyField(write_only=True,
            queryset=models.PayPeriod.objects.all())

    def to_internal_value(self, data):
        data = data.copy()
        dmy = data['date']
        data['pay_period'] = models.PayPeriod.objects.get(start_date=dmy).id
        return super(SalaryFileSerializer, self).to_internal_value(data)

    class Meta:
        model = models.SalaryFile
        fields = ('id', 'file', 'comment', 'date', 'pay_period')

# FIXME: Dynamic field for associated_
class BaseTransactionSerializer(serializers.ModelSerializer):
    date = serializers.SlugRelatedField(source='pay_period',
            queryset=models.PayPeriod.objects,
            slug_field='start_date')
    updated_on = TimestampField(read_only=True)

    class Meta:
        model = models.Transaction
        fields = ('id', 'fund', 'date', 'transactable', 'paid', 'budget',
                  'updated_on')
        read_only_fields = ('updated_on',)

class TransactionSerializer(BaseTransactionSerializer):
    class Meta:
        model = models.Transaction
        fields = ('id', 'fund', 'date', 'transactable', 'paid', 'budget',
                  'updated_on', 'associated_transactions')
        read_only_fields = ('updated_on', 'associated_transactions')

TransactionSerializer._declared_fields['associated_transactions'] = \
        TransactionSerializer(many=True, read_only=True)

# FIXME: Make 'transactions' into a list of id's
class TransactionFileSerializer(serializers.ModelSerializer):
    # transactions = TransactionSerializer(many=True, source='transaction_set')

    class Meta:
        model = models.TransactionFile
        fields = ('file', 'comment', 'timestamp',)

# Read-Only serializer for getting summaries based on different fields.
class PaymentSummarySerializer(serializers.ModelSerializer):
    # Unique identifiers
    date = serializers.DateField(required=False)
    fund = serializers.IntegerField(required=False)
    transactable = serializers.IntegerField(required=False)

    # Aggregated fields
    paid = serializers.FloatField()
    budget = serializers.FloatField()

    # Latest update time found for aggregated transactions.
    updated_on = TimestampField(required=False, read_only=True)

    class Meta:
        model = models.Transaction
        fields = ('date', 'fund', 'transactable', 'paid', 'budget', 'updated_on')
        read_only_fields = ('date', 'fund', 'transactable', 'paid', 'budget', 'updated_on')

class UserSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.UserSettings
        fields = ('user', 'data')

