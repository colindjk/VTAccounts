from django.contrib.postgres.fields import JSONField
from django.db import models
from django.db.models import Q
from django.db.models.signals import post_save
from django.db import transaction as db_transaction

from enum import Enum

from model_utils.managers import InheritanceManager
from mptt.models import MPTTModel, TreeForeignKey

from api import fields

OVERHEAD_RATE = .2443
OVERHEAD_FUND_KWARGS = {
    "name": "DAC Returned OH",
    "code": "234923"
}

OVERHEAD_ACCOUNT_KWARGS = {
    "name": "Misc. Contractual Services Bgt",
    "code": "1200"
}
INDIRECT_ACCOUNT_KWARGS = {
    "name": "Overhead - Indirect Costs",
    "code": "OH"
}

# Below is the account hierarchy.
# About rates:
# Indirect is determined at AccountBase, 
# Fringe is determined at Account.
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

    has_indirect = models.BooleanField(default=False)
    is_indirect = models.BooleanField(default=False)

    def get_transactables(self):
        ts = self.get_descendants(include_self=True).filter(
                account_level='transactable')
        return Transactable.objects.filter(id__in=[t.id for t in ts])

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
        # Only pass down when True.
        if self.parent and self.parent.has_indirect:
            self.has_indirect = True
        if self.parent and self.parent.is_indirect:
            self.is_indirect = True
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
    is_loe = models.BooleanField(default=False)

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

# destination | source
# is_fringe   | has_fringe
# is_indirect | has_indirect
# For indirect we don't worry about pointing to a destination account
# since, for indirect, the `rate` field is only based on the given Fund.
class Account(AccountBase):
    account_object = models.ForeignKey(AccountObject, on_delete=models.CASCADE)

    fringe_destination = TreeForeignKey('self', on_delete=models.DO_NOTHING,
            null=True, related_name='fringe_sources', db_index=True, blank=True)

    @property
    def has_fringe(self):
        return self.fringe_destination is not None
    @property
    def is_fringe(self):
        return len(self.fringe_sources.all()) > 0

    def save(self, *args, **kwargs):
        self.parent = getattr(self, "account_object", None)
        self.account_level = "account"
        super(Account, self).save(*args, **kwargs)

# Transactable objects are the ONLY AccountBase type which can have transactions
# made to them.
class Transactable(AccountBase):
    parent_account = models.ForeignKey('AccountBase',
            on_delete=models.DO_NOTHING,
            related_name='transactables')

    @property
    def has_fringe(self):
        return getattr(self.parent_account.into_account(), 'has_fringe', False)
    @property
    def is_fringe(self):
        return getattr(self.parent_account.into_account(), 'is_fringe', False)

    def save(self, *args, **kwargs):
        self.parent = getattr(self, "parent_account", None)
        self.has_indirect = self.parent.has_indirect
        self.account_level = "transactable"
        super(Transactable, self).save(*args, **kwargs)

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
        return self.employeesalary_set.order_by('pay_period')

    objects = EmployeeTransactableManager()
    def __str__(self):
        return "Employee: {} {}, id: {}, position: {}".format(
                self.first_name, self.last_name, self.pid, self.position_number)

class EmployeeSalaryManager(models.Manager):
    pass

# A salary will be associated with an EmployeeTransactable, which is based on
# both a specific employee, and the particular position_number.
# Exist per EmployeeTransactable + PayPeriod instance.
class EmployeeSalary(models.Model):
    total_ppay = models.FloatField()
    pay_period = fields.PayPeriodField()
    employee = models.ForeignKey('EmployeeTransactable',
            on_delete=models.DO_NOTHING)

    # FIXME: Apply source file
    source_file = models.ForeignKey('SalaryFile',
            on_delete=models.DO_NOTHING, null=True)
    created_on = models.DateTimeField(auto_now_add=True)
    updated_on = models.DateTimeField(auto_now=True)

    objects = EmployeeSalaryManager()

    class Meta():
        get_latest_by = 'pay_period'
        unique_together = ('pay_period', 'employee')

# Model used to keep track of imports
class SalaryFile(models.Model):
    pay_period = fields.PayPeriodField()
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

    budget = models.FloatField(null=True)

    # The earliest pay period that a manual transactable can be edited on. 
    # I'm not sure if I'll enforce that constraint, for debugging purposes it
    # may be better not to. 
    editable_date = fields.PayPeriodField(null=True)
    start_date = models.DateField(null=True)
    end_date   = models.DateField(null=True)

    verified   = models.BooleanField(default=False)

# Model used to keep track of imports
class TransactionFile(models.Model):
    file = models.FileField(blank=False, null=False)
    comment = models.CharField(max_length=512, default="No comment")
    timestamp = models.DateTimeField(auto_now_add=True)

# Used for verification of Transaction file import data. 
class TransactionMetadata(models.Model):
    source_file = models.ForeignKey(TransactionFile, on_delete=models.CASCADE)
    row_idx = models.IntegerField()
    # Used JSON here to make importing more flexible.
    data = JSONField(default=dict)

    class Meta: 
        unique_together = ('source_file', 'row_idx')

# Unique for each transactable + pay_period.
class Transaction(models.Model):
    id = models.AutoField(primary_key=True)

    source = models.ForeignKey(TransactionMetadata,
            related_name="associated_transactions",
            on_delete=models.CASCADE, null=True)
    update_number = models.IntegerField(default=0)

    # Foreign keys, used as part of key.
    pay_period = fields.PayPeriodField()
    fund = models.ForeignKey(Fund, on_delete=models.CASCADE)

    paid = models.FloatField(default=0)
    budget = models.FloatField(default=0)

    # paid_on will be for the specific transaction date given.
    paid_on = models.DateField(null=True)
    created_on = models.DateTimeField(auto_now_add=True)
    updated_on = models.DateTimeField(auto_now=True)

    revision_number = models.IntegerField(default=0)
    reference_id    = models.CharField(max_length=64, null=True)

    transactable = models.ForeignKey(Transactable, on_delete=models.DO_NOTHING,
                                     related_name='transactions')

    objects = InheritanceManager()

    class Type(Enum):
        PAID = "paid"
        BUDGET = "budget"

    @property
    def is_imported(self): return self.source is not None

    @property
    def is_manual(self): return not self.is_imported

# Base class for (associated) rates.
class AssociatedRate(models.Model):
    rate = models.FloatField()
    updated_on = models.DateTimeField(auto_now=True)

    @property
    def PAYMENT_TYPE(self): raise NotImplementedError
    @property
    def NAME_FORMAT(self): raise NotImplementedError
    # Returns the transactions which are pointed to by associated_transaction
    # objects which SHOULD point to this rate.
    @property
    def source_transactions(self): raise NotImplementedError

    @property
    def account(self): raise NotImplementedError
    @property
    def transactable(self):
        try:
            account = self.account
            t, c = Transactable.objects.get_or_create(
                        parent_account=account,
                        name=self.NAME_FORMAT.format(account.name),
                        code="Man. {}".format(account.code)
                    )
            return t
        except Exception:
            raise Exception("Transactable not found for associated with " \
                    "account: {}, {}. Have the accounts been imported?".format(
                        account.name, account.code))

    def get_fund(self, t): raise NotImplementedError

    # Get or creates the associated transaction based on the given transaction.
    def process_transaction(self, transaction):
        rate_object = AssociatedRate.get_rate_object(transaction)
        associated, _created = AssociatedTransaction.objects.get_or_create(
            fund=rate_object.fund,
            pay_period=transaction.pay_period,
            paid_on=transaction.paid_on,
            transactable=rate_object.transactable,
            source=transaction, associated_rate=self
        )

        associated.__dict__[self.PAYMENT_TYPE] = rate * transaction.paid
        parent = associated.transactable.parent_account
        while parent is not None:
            parent = parent.parent
        return associated.save()

    objects = InheritanceManager()

# Where `account` is the destination account, which a source account points to.
class FringeRate(AssociatedRate):
    NAME_FORMAT = "{} - Manual Fringe"
    PAYMENT_TYPE = "paid"

    pay_period = fields.PayPeriodField()
    account = models.ForeignKey(Account, on_delete=models.CASCADE)

    def get_fund(self, t): return t.fund

    class Meta:
        unique_together = ('account', 'pay_period')

class IndirectRate(AssociatedRate):
    NAME_FORMAT = "{} - Manual Indirect"
    PAYMENT_TYPE = "paid"

    pay_period = fields.PayPeriodField()
    fund = models.ForeignKey(Fund, on_delete=models.CASCADE)

    def get_fund(self, t): return self.fund

    class Meta:
        unique_together = ('fund', 'pay_period')

# A singleton class which has one element
# 24.43% of all rates go toward "DAC Returned OH".
# Singleton class with
# AccountClass 1200
class OverheadRate(AssociatedRate):
    NAME_FORMAT = "{} - Manual Overhead"
    PAYMENT_TYPE = "budget"

    def get_fund(self, t):
        return Fund.objects.get(**OVERHEAD_FUND_KWARGS)
    @property
    def account(self): return AccountClass.objects.get(**OVERHEAD_ACCOUNT_KWARGS)

# Allows for settings to be a global variable (or based on employee...)
class ClientSettings(models.Model):
    name = models.CharField(max_length=128, unique=True)
    data = JSONField(default=dict)

    def __str__(self):
        return "[{}]: {}".format(self.name, self.data)

