import datetime as sys_datetime
from django.db import models
from django.db.models import Q

from django.contrib.auth.models import User
from django.contrib.postgres.fields import JSONField
from django.utils.timezone import datetime

from enum import Enum

from model_utils.managers import InheritanceManager
from mptt.models import MPTTModel, TreeForeignKey

OVERHEAD_RATE = .2443
OVERHEAD_ACCOUNT_KWARGS = {
    "name": "Misc. Contractual Services Bgt",
    "code": "1200"
}
OVERHEAD_FUND_KWARGS = {
    "name": "DAC Returned OH",
    "code": "234923"
}

INDIRECT_ACCOUNT_KWARGS = {
    "name": "Overhead - Indirect Costs",
    "code": "OH"
}

# Below is the account hierarchy.
# FIXME: Find account for 12756
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

    # These two are the only required
    name = models.CharField(max_length=128, null=True)
    code = models.CharField(max_length=16, null=True)

    parent = TreeForeignKey('self', on_delete=models.CASCADE, null=True,
                            related_name='children', db_index=True, blank=True)

    account_level = models.CharField(max_length=30, choices=CHOICES, null=True)
    is_loe = models.BooleanField(default=False)

    def get_transactables(self):
        return self.get_descendants(include_self=True).filter(
                account_level='transactable')

    def get_transactions(self):
        return Transaction.objects.filter(
                transactable__in=self.get_transactables())

    def into_account(self):
        return {
            "account_type"      : AccountType,
            "account_group"     : AccountGroup,
            "account_sub_group" : AccountSubGroup,
            "account_class"     : AccountClass,
            "account_object"    : AccountObject,
            "account"           : Account,
            "transactable"      : Transactable,
        }[self.account_level].objects.get(id=self.id)

    objects = InheritanceManager()

    # This method will verify that properties are passed onto the children
    # correctly. 
    def save(self, *args, **kwargs):
        # self.is_loe = True if self.parent and parent.is_loe else False
        super(AccountBase, self).save(*args, **kwargs)

    def __str__(self):
        identifier = self.code or "None"
        return self.account_level or "None" + ", " + identifier

    class MPTTMeta:
        order_insertion_by = ['name']

class AccountType(AccountBase):
    def save(self, *args, **kwargs):
        self.account_level = "account_type"
        super(AccountType, self).save(*args, **kwargs)

class AccountGroup(AccountBase):
    type = models.ForeignKey(AccountType, on_delete=models.CASCADE)
    def save(self, *args, **kwargs):
        self.parent = getattr(self, "type", None)
        self.account_level = "account_group"
        super(AccountGroup, self).save(*args, **kwargs)

class AccountSubGroup(AccountBase):
    group = models.ForeignKey(AccountGroup, on_delete=models.CASCADE)

    # INDIRECT
    indirect_limit = models.IntegerField(null=True)
    def save(self, *args, **kwargs):
        self.parent = getattr(self, "group", None)
        self.account_level = "account_sub_group"
        super(AccountSubGroup, self).save(*args, **kwargs)

class AccountClass(AccountBase):
    sub_group = models.ForeignKey(AccountSubGroup, on_delete=models.CASCADE)
    def save(self, *args, **kwargs):
        self.parent = getattr(self, "sub_group", None)
        self.account_level = "account_class"
        super(AccountClass, self).save(*args, **kwargs)

class AccountObject(AccountBase):
    account_class = models.ForeignKey(AccountClass, on_delete=models.CASCADE)

    def save(self, *args, **kwargs):
        self.parent = getattr(self, "account_class", None)
        self.account_level = "account_object"
        super(AccountObject, self).save(*args, **kwargs)

# TODO: add Account OBJECT Code 11411 to the list of Level of Effort calculations
class Account(AccountBase):
    account_object = models.ForeignKey(AccountObject, on_delete=models.CASCADE)

    def save(self, *args, **kwargs):
        self.parent = getattr(self, "account_object", None)
        self.account_level = "account"
        super(Account, self).save(*args, **kwargs)

class EmployeeManager(models.Manager):
    # Gets an employee based on the salary data.
    # Returns: (employee, was_just_created)
    def get_from_salary_data(self, salary_data):
        names = [x.strip() for x in salary_data.full_name.split(',')]
        last_name = names[0]
        first = [x for x in names[1].split()] # NOTE: NOT necessarily first name
        first_name = first[0]
        middle_name = None

        # If the length is greater than 1, there is a middle name -> extract it
        if len(first) > 1:
            middle_name = ""
            # All extra names aside from the first are the "middle_name"
            for name in first[-1:]:
                middle_name += name + " "
            middle_name = middle_name[:-1]

        return Employee.objects.get_or_create(pid=salary_data.pid, defaults={
                "first_name": first_name.title(),
                "middle_name": (middle_name or '').title(),
                "last_name": last_name.title(),
            })

# Employee's will be stored in the database simply for their names and pid
# values. 
class Employee(models.Model):
    first_name  = models.CharField(max_length=64)
    middle_name = models.CharField(max_length=64)
    last_name   = models.CharField(max_length=128)
    pid = models.IntegerField(unique=True)

    created_on = models.DateTimeField(auto_now_add=True)
    updated_on = models.DateTimeField(auto_now=True)

    objects = EmployeeManager()
    def __str__(self):
        return self.last_name + ", " + self.first_name + \
                ", pid: " + str(self.pid)

# Transactable objects are the ONLY AccountBase type which can have transactions
# made to them.
class Transactable(AccountBase):
    parent_account = models.ForeignKey('AccountBase',
            on_delete=models.DO_NOTHING,
            related_name='transactables')

    def save(self, *args, **kwargs):
        self.parent = getattr(self, "parent_account", None)
        self.account_level = "transactable"
        super(Transactable, self).save(*args, **kwargs)

class EmployeeTransactableManager(models.Manager):

    # The `salary_data` summarizes a line in the file for salary verification. 
    def get_from_salary_data(self, salary_data):
        (emp, e_created) = Employee.objects.get_from_salary_data(salary_data)
        position_numbers = [x for x in salary_data.full_position_number.split("-")]
        (emp_tactable, et_created) = EmployeeTransactable.objects.get_or_create(
                    employee=emp, position_number=position_numbers[0],
                    defaults={
                        "total_salary": salary_data.total_salary,
                        "category": salary_data.category,
                    }
                )
        first_initial = (emp.first_name or "")[:1]
        if emp_tactable.transactable is None:
            transactables = Transactable.objects.filter(
                    Q(name__icontains=emp.last_name + ",") &
                    Q(name__icontains=first_initial) &
                    Q(name__icontains=emp_tactable.position_number)
                )
            if len(transactables) > 1:
                print("Error: Multiple matching transactables found!")
                for t in transactables:
                    print(t.name)
            elif len(transactables) == 1:
                print("Single transactable found")

            # Now execute the assigning of a transaction.
            # This code urgently needs to be revised, but it works.
            if len(transactables) >= 1:
                transactable = transactables.first()
                # TODO: Make this kosher...
                try:
                    transactable.employee_transactable
                    print("ERROR: Transactable {} already matched to {}.".format(
                            transactable.name, transactable.employee_transactable
                        ))
                    print("Employee not matched: {}.".format(emp))
                    return None
                except:
                    pass
                # Catches exception and continues as usual? wat?
                emp_tactable.transactable = transactables.first()
                emp_tactable.save()

        return emp_tactable

class EmployeeTransactable(models.Model):
    CATEGORY_CHOICES = (
            ("Staff", "Staff"), ("GRA", "GRA"), ("GTA", "GTA"),
            ("TR Faculty", "TR Faculty"), ("AP Faculty", "AP Faculty"),)

    total_salary = models.FloatField()
    category = models.CharField(choices=CATEGORY_CHOICES, max_length=32)
    transactable = models.OneToOneField(Transactable, null=True,
            related_name="employee_transactable", on_delete=models.DO_NOTHING)
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)

    position_number = models.CharField(max_length=32)
    # position_code? TODO: -> Employee PayPeriod resolution
    # org_code? TODO: Discuss this!

    @property
    def pid(self): return self.employee.pid
    @property
    def first_name(self): return self.employee.first_name or ""
    @property
    def middle_name(self): return self.employee.middle_name or ""
    @property
    def last_name(self): return self.employee.last_name or ""

    @property
    def salaries(self):
        return self.employeesalary_set.order_by('pay_period__start_date')

    objects = EmployeeTransactableManager()
    def __str__(self):
        return "Employee: {} {}, id: {}, position: {}".format(
                self.first_name, self.last_name, self.pid, self.position_number)

class EmployeeSalaryManager(models.Manager):

    def get_salary(self, employee_transactable, pay_period):
        is_virtual = True
        salaries = EmployeeSalary.objects.filter(employee=employee_transactable,
                pay_period=pay_period)

        salary = None
        if len(salaries) == 1:
            salary = salaries.first()
            is_virtual = False
        elif len(salaries) == 0:
            salaries = EmployeeSalary.objects.filter(
                    employee=employee_transactable,
                    pay_period__start_date__lte=pay_period.start_date)
            if len(salaries) != 0:
                salary = salaries.latest()

        return (salary, is_virtual)

# A salary will be associated with an EmployeeTransactable, which is based on
# both a specific employee, and the particular position_number.
# Exist per EmployeeTransactable + PayPeriod instance.
class EmployeeSalary(models.Model):
    total_ppay = models.FloatField()
    pay_period = models.ForeignKey('PayPeriod', on_delete=models.DO_NOTHING)
    employee = models.ForeignKey('EmployeeTransactable',
            on_delete=models.DO_NOTHING)

    # FIXME: Apply source file
    source_file = models.ForeignKey('SalaryFile',
            on_delete=models.DO_NOTHING, null=True)
    created_on = models.DateTimeField(auto_now_add=True)
    updated_on = models.DateTimeField(auto_now=True)

    objects = EmployeeSalaryManager()

    class Meta():

        get_latest_by = 'pay_period__start_date'
        unique_together = ('pay_period', 'employee')

# This will hold all of the pay periods that an transaction could be made on. 
class PayPeriod(models.Model):
    id = models.AutoField(primary_key=True)
    start_date = models.DateField(unique=True)

    @classmethod
    def get_by_pay_period_number(cls, year, number):
        periods = [(1, 9), (1, 24), (2, 9), (2, 24), (3, 9), (3, 24), (4, 9),
                   (4, 24), (5, 9), (5, 24), (6, 9), (6, 24),
                   (7, 9), (7, 24), (8, 9), (8, 24), (9, 9), (9, 24),
                   (10, 9), (10, 24), (11, 9), (11, 24), (12, 9), (12, 24)]
        periods[number - 1]

    # TODO: Put this in the soon to exist `PayPeriodManager` class.
    @classmethod
    def fiscal_year(cls, year):

        periods = [(1, 9), (1, 24), (2, 9), (2, 24), (3, 9), (3, 24), (4, 9),
                   (4, 24), (5, 9), (5, 24), (6, 9), (6, 24),
                   (7, 9), (7, 24), (8, 9), (8, 24), (9, 9), (9, 24),
                   (10, 9), (10, 24), (11, 9), (11, 24), (12, 9), (12, 24)]

        dates = []
        for (month, day) in periods:
            (pay_period, _created) = cls.objects.get_or_create(
                    start_date=datetime(year, month, day))
            dates.append(pay_period)

        return dates

    # Supply year, month, day to get the correct pay_period
    @classmethod
    def get_by_date(cls, year, month, day):
        return PayPeriod.objects.filter(
                start_date__lte=sys_datetime.date(year, month, day)).latest()

    def __unicode__(self):
        return str(self.start_date)

    class Meta:
        get_latest_by = 'start_date'

# Model used to keep track of imports
class SalaryFile(models.Model):
    pay_period = models.ForeignKey(PayPeriod, on_delete=models.DO_NOTHING)
    file = models.FileField(blank=False, null=False)
    comment = models.CharField(max_length=512, default="No comment")
    timestamp = models.DateTimeField(auto_now_add=True)

# User will have the ability to add / remove through import scripts and forms
# Budget changes involve deposits, budget doesn't change based on transaction.
class Fund(models.Model):
    id = models.AutoField(primary_key=True)

    # These values must be supplied upon creatino of the fund.
    name = models.CharField(max_length=128)
    code = models.CharField(unique=True, max_length=128)

    # How can these be (pre)determined given tdata?
    organization = models.CharField(max_length=128, null=True)
    principal_investigator = models.CharField(max_length=128, null=True)

    budget = models.FloatField(null=True) # amount_allocated

    start_date = models.DateField(null=True)
    end_date   = models.DateField(null=True)

    verified   = models.BooleanField(default=False)
    indirect_rate = models.FloatField(default=0.0)

# Model used to keep track of imports
class TransactionFile(models.Model):
    file = models.FileField(blank=False, null=False)
    comment = models.CharField(max_length=512, default="No comment")
    timestamp = models.DateTimeField(auto_now_add=True)

# Unique for each transactable + pay_period.
class Transaction(models.Model):
    id = models.AutoField(primary_key=True)

    # is this imported.
    source_file = models.ForeignKey(TransactionFile,
            on_delete=models.DO_NOTHING, null=True)
    update_number = models.IntegerField(default=0)

    # Foreign keys, used as part of key.
    # FIXME: Write tests to verify pay_period resolution.
    pay_period = models.ForeignKey(PayPeriod, on_delete=models.CASCADE)
    fund       = models.ForeignKey(Fund,      on_delete=models.CASCADE)

    paid = models.FloatField(default=0)
    budget = models.FloatField(default=0)

    # paid_on will be for the specific transaction date given.
    paid_on = models.DateField(null=True)
    created_on = models.DateTimeField(auto_now_add=True)
    updated_on = models.DateTimeField(auto_now=True)

    is_manual       = models.BooleanField(default=False)
    revision_number = models.IntegerField(default=0)
    reference_id    = models.CharField(max_length=64, null=True)

    transactable = models.ForeignKey(Transactable, on_delete=models.DO_NOTHING,
                                     related_name='transactions')

    objects = InheritanceManager()

    class PaymentType(Enum):
        PAID = "paid"
        BUDGET = "budget"

    @property
    def is_imported(self): return self.source_file is not None

    @property
    def is_manual(self): return not self.is_imported

    def save(self, *args, **kwargs):
        account = self.transactable.parent_account.into_account()

        super(Transaction, self).save(*args, **kwargs)

        # For to avoid recursion death
        if AssociatedTransaction.objects.filter(id=self.id).first():
            return

        # If given no source file.
        if self.source_file is None:
            for rate in account.associated_rates.select_subclasses():
                rate.process_transaction(self)

# Used to create transactions when based on percentage of another transaction
# Only used with manually created transactions. 
class AssociatedTransaction(Transaction):
    source = models.ForeignKey(Transaction, on_delete=models.CASCADE,
            related_name="associated_transactions")

# An associated rate is "assigned" to a destination account to route money from
# source accounts to the destination account. Since transactions cannot be made
# directly to accounts, a generic method for transactable resolution is provided
# FIXME: Add validation to ensure distinct subclass type in `source_accounts`.
class AssociatedRate(models.Model):
    PAYMENT_TYPE = "paid" # Default payment type, based on Class, not row inst.

    # OneToOne field to enforce unique constraint on foreign key. 
    destination_account = models.OneToOneField(AccountBase,
            on_delete=models.CASCADE)
    source_accounts = models.ManyToManyField(AccountBase,
            related_name="associated_rates")

    objects = InheritanceManager()

    @property
    def NAME_FORMAT(self): raise NotImplementedError
    def get_rate(self, transaction): raise NotImplementedError
    def get_fund(self, transaction): return transaction.fund

    # Get or creates the associated transaction based on the given transaction.
    def process_transaction(self, transaction):
        rate = self.get_rate(transaction)
        associated, _created = AssociatedTransaction.objects.get_or_create(
                fund=self.get_fund(transaction),
                pay_period=transaction.pay_period,
                paid_on=transaction.paid_on,
                transactable=self.destination_transactable,
                source=transaction)

        associated.__dict__[self.PAYMENT_TYPE] = rate * transaction.paid
        # print("Paid: {}, rate: {}, associated: {}".format(
                # transaction.paid, rate, associated.__dict__))
        parent = associated.transactable.parent_account
        while parent is not None:
            # print("{}: {};".format(parent.account_level, parent.name))
            parent = parent.parent
        return associated.save()

    @property
    def destination_transactable(self):
        if self.destination_account.account_level == "transactable":
            return self.destination_account.into_account()
        transactable = None
        try:
            account = self.destination_account
            transactable = Transactable.objects.get(parent_account=account,
                        name=self.NAME_FORMAT.format(account.name),
                        code="Man. {}".format(account.code)
                    )
        except Exception:
            raise Exception("Transactable not found for associated rate with " \
                    "account: {}, {}. Have the accounts been imported?".format(
                        account.name, account.code))
        return transactable

class FringeRate(AssociatedRate):
    NAME_FORMAT = "{} - Manual Fringe"

    rates = JSONField(default={}) # { year: rate, ... }

    def get_rate(self, transaction):
        year = str(transaction.pay_period.start_date.year)
        return float(self.rates.get(year, 0))

# Singleton model which bases associated_transactions value off of indirect_rate 
class IndirectRate(AssociatedRate):
    NAME_FORMAT = "{} - Manual Indirect"

    def get_rate(self, transaction):
        return transaction.fund.indirect_rate

# Can be looked at as an extension of IndirectRate, sends budget payments to
# fund "DAC Returned OH".
class OverheadRate(AssociatedRate):
    NAME_FORMAT = "{} - Manual Overhead"
    PAYMENT_TYPE = "budget"

    def get_rate(self, transaction):
        return OVERHEAD_RATE * transaction.fund.indirect_rate
    def get_fund(self, transaction):
        return Fund.objects.get(**OVERHEAD_FUND_KWARGS)

# Allows for settings to be a global variable (or based on employee...)
class UserSettings(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    data = JSONField(null=True)

    def __str__(self):
        return "%'s settings.".format(user.username)
