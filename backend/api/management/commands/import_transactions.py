import os, sys, csv, re
import xlrd

from django.core.management.base import BaseCommand
from django.conf import settings

from api import models

from django.utils.timezone import datetime

# TODO: Refactor this section such that code for importing transactions is in
#       either in `models.py`, or some other related file. 
class TransactionData(object):

    # Takes a single line as input, which an array where each element pertains
    # to a value.
    def __init__(self, ws, row):
        self.year = ws.cell_value(row, 0)
        self.month = ws.cell_value(row, 1)
        self.l3_senior_management_code = ws.cell_value(row, 2)
        self.l3_senior_management_name = ws.cell_value(row, 3)
        self.l4_management_code = ws.cell_value(row, 4)
        self.l4_management_name = ws.cell_value(row, 5)
        self.l5_department_code = ws.cell_value(row, 6)
        self.l5_department_name = ws.cell_value(row, 7)
        self.l6_organization_code = ws.cell_value(row, 8)
        self.l6_organization_name = ws.cell_value(row, 9)

        # TODO : New fund? user field `name` and `id`.
        self.l7_fund_code = ws.cell_value(row, 10)
        self.l7_fund_name = ws.cell_value(row, 11)
        self.account_reporting_category = ws.cell_value(row, 12)
        self.l7_account_code = ws.cell_value(row, 13)
        self.l7_account_name = ws.cell_value(row, 14)
        date_tuple = xlrd.xldate_as_tuple(ws.cell_value(row, 15), 0)
        self.transaction_date = datetime.strptime(
                str("{}/{}/{}".format(
                    date_tuple[1], date_tuple[2], date_tuple[0])), "%m/%d/%Y")
        # Employees Name if below wages.
        self.transaction_description = ws.cell_value(row, 16)
        self.transaction_code = ""
        self.rule = ws.cell_value(row, 17)
        self.transaction_document = ws.cell_value(row, 18)
        # This field is used for payperiod resolution for employees.
        self.transaction_reference_identifier = ws.cell_value(row, 19)
        self.transaction_encumbrance_identifier = ws.cell_value(row, 20)
        self.transaction_data_entry_user = ws.cell_value(row, 21)
        self.transaction_system_activity_date = ws.cell_value(row, 22)
        self.data_mart_finance_last_updated_date = ws.cell_value(row, 23)

        # TODO : Handle this field if there's a value here.
        self.itd_adjusted_budget_amount = ws.cell_value(row, 24)
        self.actual_amount = float(ws.cell_value(row, 25))
        # self.itd_open_commitments_amount = ws.cell_value[26]
        # End of data

        self.account_instance = None

def get_by_pay_period_number(year, number):
    periods = [(1, 9), (1, 24), (2, 9), (2, 24), (3, 9), (3, 24), (4, 9),
               (4, 24), (5, 9), (5, 24), (6, 9), (6, 24),
               (7, 9), (7, 24), (8, 9), (8, 24), (9, 9), (9, 24),
               (10, 9), (10, 24), (11, 9), (11, 24), (12, 9), (12, 24)]
    (month, day) = periods[number - 1]
    return models.PayPeriod.get_by_date(year, month, day)

def is_employee_ref_id(ref_id):
    rex = re.compile("^[0-9][0-9][0-9]-[0-9][0-9]$")
    if rex.match(ref_id):
        return True
    else:
        return False

# Returns a two element tuple (pay_period, revision_number)
def resolve_pay_period(tdata):
    year = int(tdata.year)
    ref_id = tdata.transaction_reference_identifier
    if is_employee_ref_id(ref_id):
        (pay_period, revision) = ref_id.split('-')
        pay_period_number = int(pay_period)
        revision_number = int(revision)
        pay_period = get_by_pay_period_number(year, pay_period_number)
        return (pay_period, revision_number)
    else:
        pay_period = models.PayPeriod.objects.filter(
                start_date__lte=tdata.transaction_date).latest()
        return (pay_period, 0)

# Specifically imports csv files atm
class TransactionsFileHandler(object):

    def __init__(self, ws, file_instance=None):
        self.ws = ws
        self.file_instance = file_instance

    # Imports the file of transaction details, returns the number of new funds
    # created based on code / name. 
    def import_file(self):

        # models.Transaction.objects.all().delete()
        # Store the current account
        cur_account = None
        cur_fund = None

        not_verified = 0

        # This skips the first line which is reserved for titles.
        iter_rows = range(1, self.ws.nrows).__iter__()
        for row_idx in iter_rows:

            try:
                tdata = TransactionData(self.ws, row_idx)
            except ValueError:
                print("ERROR: Transaction line not valid during import")

            cur_account = models.AccountBase.objects.filter(
                    code=tdata.l7_account_code,).first()
            if cur_account is None:
                print("Error, account not found for: {}".format(
                    tdata.l7_account_code))
                continue

            cur_fund, created = models.Fund.objects.get_or_create(
                                            code=tdata.l7_fund_code,
                                            name=tdata.l7_fund_name,
                                            defaults={'verified': False})

            if created:
                not_verified += 1
            tdata.account_instance = cur_account

            # Get the specific pay period this taction will be labeled on
            (pay_period, revision_number) = resolve_pay_period(tdata)

            (transactable, created) = models.Transactable.objects.get_or_create(
                    name=tdata.transaction_description,
                    code=tdata.transaction_code,
                    parent_account=tdata.account_instance)
            transactable.save()

            budget = 0
            try:
                budget = float(tdata.itd_adjusted_budget_amount)
            except:
                budget = 0
            taction = models.Transaction.objects.create(
                pay_period=pay_period,    fund=cur_fund,
                paid=tdata.actual_amount, transactable=transactable,
                budget=budget,            paid_on=tdata.transaction_date,
                source_file=self.file_instance,
                revision_number=revision_number,
            )

        return not_verified


class Command(BaseCommand):

    def handle(self, *args, **kwargs):
        wb = xlrd.open_workbook(
                '{}/imports/FIN Transaction Detail - YTD plain text.xlsx'
                .format(settings.BASE_DIR))

        ws = wb.sheet_by_index(0)
        TransactionsFileHandler(ws).import_file()


