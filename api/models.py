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

    # These two are the only required
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
            "account_type"      : AccountType,
            "account_group"     : AccountGroup,
            "account_sub_group" : AccountSubGroup,
            "account_class"     : AccountClass,
            "account_object"    : AccountObject,
            "account"           : Account,
            "transactable"      : Transactable,
        }[self.account_level].objects.get(id=self.id)

    def save(self, *args, **kwargs):
        if self.parent is not None and self.parent.is_loe:
            self.is_loe = True
        super(AccountBase, self).save(*args, **kwargs)

    def __str__(self):
        return self.account_level + " " + self.code

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
    fringe = models.ForeignKey('self', null=True,
            related_name="fringe_source", on_delete=models.DO_NOTHING)
    indirect = models.ForeignKey('self', null=True,
            related_name="indirect_source", on_delete=models.DO_NOTHING)

    def get_fringe(self, year):
        if self.fringe is not None:
            self.fringe.fringe_rate_set.filter(fiscal_year=year).first()
    def get_indirect(self, fund):
        if self.indirect is not None:
            self.indirect.indirect_rate_set.filter(fund=fund).first()

    # This aggregates by fund to determine how much spending has gone to an
    # account instance from a particular fund.
    @property
    def spending_total(self, fund):
        pass

    def save(self, *args, **kwargs):
        self.parent = getattr(self, "account_object", None)
        self.account_level = "account"
        super(Account, self).save(*args, **kwargs)

class EmployeeManager(models.Manager):
    pass

# Employee's will be stored in the database simply for their names and pid
# values. 
class Employee(models.Model):
    first_name  = models.CharField(max_length=64, null=True)
    middle_name = models.CharField(max_length=64, null=True)
    last_name   = models.CharField(max_length=128, null=True)
    pid = models.IntegerField()

    def __str__(self):
        return self.last_name + ", " + self.first_name + \
                ", pid: " + str(self.pid)

# An account base with which one transaction can be made for each pay period
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
    def get_from_salary(self, salary_data):
        names = [x.strip() for x in salary_data.full_name.split(',')]
        last_name = names[0]
        first = [x for x in names[1].split()]
        first_name = first[0]
        middle_name = None
        if len(first) > 1:
            middle_name = ""
            for name in first[-1:]:
                middle_name += name + " "
            middle_name = middle_name[:-1]
        Employee.objects.get_or_create(pid=salary_data.pid, defaults={
                "first_name": first_name,
                "middle_name": middle_name,
                "last_name": last_name,
            })

        # last = names[0]
        # first = names[1]
        # number = names[2]
        return None
        # return EmployeeTransactable.objects.get_or_create(
                # transactable=transactable, first_name=first, last_name=last,
                # position_number=number)

class EmployeeTransactable(models.Model):
    CATEGORY_CHOICES = (
            ("Staff", "Staff"), ("GRA", "GRA"), ("GTA", "GTA"),
            ("TR Faculty", "TR Faculty"), ("AP Faculty", "AP Faculty"),)

    total_salary = models.FloatField()
    category = models.CharField(choices=CATEGORY_CHOICES, max_length=32)
    transactable = models.OneToOneField(Transactable,
            on_delete=models.DO_NOTHING)
    employee = models.ForeignKey(Employee, on_delete=models.DO_NOTHING)

    position_number = models.CharField(max_length=32)

    objects = EmployeeTransactableManager()

class EmployeeSalaryManager(models.Manager):

    def create_salary(cls, *args, **kwargs):
        pass

# A salary will be associated with an EmployeeTransactable, which is based on
# both a specific employee, and the particular position_number.
# Exist per EmployeeTransactable + PayPeriod instance.
class EmployeeSalary(models.Model):
    total_ppay = models.FloatField()
    pay_period = models.ForeignKey('PayPeriod', on_delete=models.DO_NOTHING)
    employee = models.ForeignKey('EmployeeTransactable',
            on_delete=models.DO_NOTHING)

    objects = EmployeeSalaryManager

    class Meta():

        unique_together = ('pay_period', 'employee')

# This will hold all of the pay periods that an employee will be paid for. 
class PayPeriod(models.Model):
    id = models.AutoField(primary_key=True)
    start_date = models.DateField(null=True)

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
    def __unicode__(self):
        return str(self.start_date)

    class Meta:
        get_latest_by = 'start_date'

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
    update_number = models.IntegerField(default=0)

    # Foreign keys, used as part of key.
    pay_period = models.ForeignKey(PayPeriod, on_delete=models.CASCADE)
    fund       = models.ForeignKey(Fund,      on_delete=models.CASCADE)

    paid = models.FloatField(default=0)
    budget = models.FloatField(default=0)

    # paid_on will be for the specific transaction date given.
    paid_on = models.DateTimeField(null=True)
    created_on = models.DateTimeField(null=True)
    updated_on = models.DateTimeField(null=True)

    is_paid         = models.BooleanField(default=False)
    revision_number = models.IntegerField(default=0)

    transactable = models.ForeignKey(Transactable, on_delete=models.DO_NOTHING,
                                     related_name='transactions')

    def save(self, *args, **kwargs):
        account = getattr(self.transactable, "parent_account").into_account()

        if isinstance(account, Account):
            fringe = account.get_fringe(self.pay_period.start_date.year)
            indirect = account.get_indirect(self.fund)

            # Fringe and indirect will only really matter.
            if fringe is not None:
                (fringe_transactable, _fcreated) = Transactable.get_or_create(
                        parent_account=fringe, code="Fringe Summary",
                        name="Fringe: {}".format(self.name),)
                taction = Transaction.get_or_create(pay_period=self.pay_period,
                        fund=self.fund, transactable=fringe_transactable,)
                taction.paid = self.amount * fringe.estimate_rate
                taction.save()

            if indirect is not None:
                (indirect_transactable, _icreated) = Transactable.get_or_create(
                        parent_account=indirect, code="Indirect Summary",
                        name="Indirect: {}".format(self.name),)
                taction = Transaction.get_or_create(pay_period=self.pay_period,
                        fund=self.fund, transactable=indirect_transactable,)
                taction.paid = self.amount * indirect.estimate_rate
                taction.save()

        super(Transaction, self).save(*args, **kwargs)

FISCAL_YEAR_CHOICES = []
for r in range(2017, (datetime.now().year + 2)):
    FISCAL_YEAR_CHOICES.append((r, r))

# There are multiple FringeRates per fringe account, each pertaining to a
# particular year.
class FringeRate(models.Model):
    rate = models.FloatField()
    fiscal_year = models.IntegerField(('year'), choices=FISCAL_YEAR_CHOICES,
                                      default=datetime.now().year)
    account = models.ForeignKey(Account, on_delete=models.DO_NOTHING)

    class Meta():
        unique_together = (('account', 'fiscal_year'),)

class IndirectRate(models.Model):
    rate = models.FloatField()
    account = models.ForeignKey(Account, on_delete=models.DO_NOTHING)
    fund = models.ForeignKey(Fund, on_delete=models.DO_NOTHING)

    class Meta():
        unique_together = (('account', 'fund'),)

