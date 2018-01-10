from django.db import models
from mptt.models import MPTTModel, TreeForeignKey

from django.utils.timezone import datetime

# Below is the account hierarchy.
class AccountBase(MPTTModel):
    CHOICES = [
        ("account_type",       "account_type"),
        ("account_group",      "account_group"),
        ("account_sub_group",  "account_sub_group"),
        ("account_class",      "account_class"),
        ("account_object",     "account_object"),
        ("account",            "account"),
        ("transactable",       "transactable"),
    ]

    id = models.AutoField(primary_key=True)

    name = models.CharField(max_length=128, null=True)
    code = models.CharField(max_length=16, null=True)

    parent = TreeForeignKey('self', on_delete=models.CASCADE, null=True,
                            related_name='children', db_index=True, blank=True)

    account_level = models.CharField(max_length=30, choices=CHOICES, null=True)
    is_loe = models.BooleanField(default=False)

    @property
    def transactables(self):
        return self.into_account().transaction_set

    def into_account(self):
        return {
            "account_type"       : AccountType,
            "account_group"      : AccountGroup,
            "account_sub_group"  : AccountSubGroup,
            "account_class"      : AccountClass,
            "account_object"     : AccountObject,
            "account"            : Account,
            "transaction_object" : TransactionObject,
        }[self.account_level].objects.get(id=self.id)

    def save(self, *args, **kwargs):
        if self.parent.is_loe:
            self.is_loe = True
        super(MPTTModel, self).save(*args, **kwargs)

    def __str__(self):
        return self.account_level + " " + self.code

    class MPTTMeta:
        order_insertion_by = ['name']

# Employee's will be stored in the database simply for their names and pid
# values. 
class Employee(models.Model):
    first_name = models.CharField(max_length=64)
    last_name = models.CharField(max_length=128)
    pid = models.IntegerField()

    def __str__(self):
        return self.last_name + ", " + self.first_name + ", id: " + str(self.id)

# An account base with which one transaction can be made for each pay period
class Transactable(AccountBase):
    account = models.ForeignKey('AccountBase', on_delete=models.DO_NOTHING,
                                related_name='transactables')

class EmployeeTransactable(models.Model):
    transactable = models.ForeignKey(Transactable, on_delete=models.DO_NOTHING)
    employee = models.ForeignKey(Employee, on_delete=models.DO_NOTHING)
    position_number = models.CharField(max_length=32)

# A salary will be associated with an EmployeeTransactable, which is based on
# both a specific employee, and the particular position_number.
# Exist per EmployeeTransactable + PayPeriod instance.
class EmployeeSalary(models.Model):
    amount = models.FloatField()
    pay_period = models.ForeignKey('PayPeriod', models.DO_NOTHING)
    employee = models.ForeignKey('EmployeeTransactable', models.DO_NOTHING)

    class Meta():
        unique_together = ('pay_period', 'employee')

# This will hold all of the pay periods that an employee will be paid for. 
class PayPeriod(models.Model):
    id = models.AutoField(primary_key=True)
    start_date = models.DateField(null=True)

    def __unicode__(self):
        return str(self.start_date)

# User will have the ability to add / remove through import scripts and forms
# Budget changes involve deposits, budget doesn't change based on transaction.
class Fund(models.Model):
    id = models.AutoField(primary_key=True)

    # These values must be supplied upon creatino of the fund.
    fund_name = models.CharField(max_length=128)
    code = models.CharField(unique=True, max_length=128)

    # How can these be (pre)determined given tdata?
    organization = models.CharField(max_length=128, null=True)
    principal_investigator = models.CharField(max_length=128, null=True)

    budget = models.FloatField(null=True) # amount_allocated

    start_date = models.DateField(null=True)
    end_date   = models.DateField(null=True)

    verified   = models.BooleanField(default=False)

# Unique for each transactable + pay_period.
class Transaction(models.Model):
    id = models.AutoField(primary_key=True)

    # is this imported.
    is_imported = models.BooleanField(default=False)

    fiscal_year   = models.DateTimeField(null=True)
    update_number = models.IntegerField(default=0)

    # Foreign keys, used as part of key.
    pay_period = models.ForeignKey(PayPeriod, on_delete=models.CASCADE)
    fund       = models.ForeignKey(Fund,      on_delete=models.CASCADE)

    paid = models.FloatField(default=0)
    budget = models.FloatField(default=0)

    created_on = models.DateTimeField(null=True)
    updated_on = models.DateTimeField(null=True)

    is_paid         = models.BooleanField(default=False)
    revision_number = models.IntegerField(default=0)

    transactable = models.ForeignKey(Transactable, on_delete=models.DO_NOTHING,
                                     related_name='transactions')

    class Meta():
        unique_together = ('pay_period', 'transactable')


