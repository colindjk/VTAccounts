import os, sys, csv, re, json
import xlrd

from django.core.management.base import BaseCommand
from django.core.files import File
from django.conf import settings

from api import models, fields

from django.utils.timezone import datetime

# helper function to get an exact amount relating to the value given.
def get_amount(value):
    return float(re.sub('[^0-9|\.|\-]', '', str(value)))

# TODO: Refactor this section such that code for importing transactions is in
#       either in `models.py`, or some other related file. 
class TransactionData(object):

    # Takes a single line as input, which an array where each element pertains
    # to a value.
    # TODO: Make it so no more floating points, int based on .00 .
    def __init__(self, ws, row):
        self.year = ws.cell_value(row, 0).strip()
        self.month = ws.cell_value(row, 1).strip()
        self.l3_senior_management_code = ws.cell_value(row, 2).strip()
        self.l3_senior_management_name = ws.cell_value(row, 3).strip()
        self.l4_management_code = ws.cell_value(row, 4).strip()
        self.l4_management_name = ws.cell_value(row, 5).strip()
        self.l5_department_code = ws.cell_value(row, 6).strip()
        self.l5_department_name = ws.cell_value(row, 7).strip()
        self.l6_organization_code = ws.cell_value(row, 8).strip()
        self.l6_organization_name = ws.cell_value(row, 9).strip()

        # TODO : New fund? user field `name` and `id`.
        self.l7_fund_code = ws.cell_value(row, 10).strip()
        self.l7_fund_name = ws.cell_value(row, 11).strip()
        self.account_reporting_category = ws.cell_value(row, 12).strip()
        self.l7_account_code = ws.cell_value(row, 13).strip()
        self.l7_account_name = ws.cell_value(row, 14).strip()

        date_tuple = xlrd.xldate_as_tuple(ws.cell_value(row, 15), 0)
        self.transaction_date = datetime(*date_tuple).isoformat().split('T')[0]

        # Employees Name if below wages.
        self.transaction_description = ws.cell_value(row, 16).strip()
        self.transaction_code = ""
        self.rule = ws.cell_value(row, 17).strip()
        self.transaction_document = ws.cell_value(row, 18).strip()
        # This field is used for payperiod resolution for employees.
        self.transaction_reference_identifier = ws.cell_value(row, 19).strip()
        self.transaction_encumbrance_identifier = ws.cell_value(row, 20).strip()
        self.transaction_data_entry_user = ws.cell_value(row, 21).strip()

        sys_date_tuple = xlrd.xldate_as_tuple(ws.cell_value(row, 22), 0)
        self.transaction_system_activity_date = \
                datetime(*sys_date_tuple).isoformat()

        last_date_tuple = xlrd.xldate_as_tuple(ws.cell_value(row, 23), 0)
        self.data_mart_finance_last_updated_date = \
                datetime(*last_date_tuple).isoformat()

        # TODO : Handle this field if there's a value here.
        self.itd_adjusted_budget_amount = ws.cell_value(row, 24)
        self.actual_amount = ws.cell_value(row, 25)
        self.itd_open_commitments_amount = ws.cell_value(row, 26)
        # End of data

def is_employee_ref_id(ref_id):
    rex = re.compile("^[0-9][0-9][0-9]-[0-9][0-9]$")
    if rex.match(ref_id):
        return True
    else:
        return False

# Employee payments have a different reference_identifier which refers to the
# pay period the employee is getting paid for.
# Returns a two element tuple (pay_period, revision_number)
def resolve_pay_period(tdata):
    year = int(tdata.year)
    ref_id = tdata.transaction_reference_identifier
    if is_employee_ref_id(ref_id):
        (pay_period, revision) = ref_id.split('-')
        number = int(pay_period)
        revision_number = int(revision)
        pay_period = fields.pay_period_from_num(year, number)
        return (pay_period, revision_number)
    else:
        pay_period = fields.pay_period_from_iso(tdata.transaction_date)
        return (pay_period, 0)

# Transaction file. 
class TransactionsFileHandler(object):

    def __init__(self, ws, file_instance=None):
        self.ws = ws
        self.file_instance = file_instance

    # Imports the file of transaction details, returns the number of new funds
    # created based on code / name. 
    def import_file(self):

        # models.Transaction.objects.all().delete()
        # Store the current account
        not_verified = 0

        # This skips the first line which is reserved for titles.
        iter_rows = range(1, self.ws.nrows).__iter__()
        for row_idx in iter_rows:
            try:
                tdata = TransactionData(self.ws, row_idx)
            except ValueError:
                print("ERROR: Transaction line not valid during "\
                        "import for row: {}".format(row_idx))
                break

            try:
                t_meta_data = models.TransactionMetadata.objects.create(
                    source_file=self.file_instance,
                    row_idx=row_idx,
                    data=tdata.__dict__,
                )
            except Exception as e:
                print("Creating transaction meta data failed "\
                        "at row {}:".format(row_idx))
                print(e)
                break

            # Given accounts, find the closes matching name
            accounts = models.AccountBase.objects.filter(
                    code=tdata.l7_account_code)

            if len(accounts) is 0:
                print("Error, account not found for: {}".format(
                    tdata.l7_account_code))
                continue
            if len(accounts) > 1:
                for a in accounts:
                    print(a.account_level)
                print(tdata.l7_account_name, tdata.l7_account_code)
                print("--------------------------")

            cur_fund, created = models.Fund.objects.get_or_create(
                                            code=tdata.l7_fund_code,
                                            defaults={
                                                'name': tdata.l7_fund_name,
                                                'verified': False,
                                            })

            if created:
                not_verified += 1
            account_instance = accounts.first()

            # Get the specific pay period this taction will be labeled on
            (pay_period, revision_number) = resolve_pay_period(tdata)

            (transactable, created) = models.Transactable.objects.get_or_create(
                    name=tdata.transaction_description,
                    code=tdata.transaction_code,
                    parent_account=account_instance)
            transactable.save()

            taction = models.Transaction.objects.create(
                pay_period=pay_period,    fund=cur_fund,
                paid=get_amount(tdata.actual_amount), 
                budget=get_amount(tdata.itd_adjusted_budget_amount),
                paid_on=tdata.transaction_date,
                source=t_meta_data,
                transactable=transactable,
                revision_number=revision_number,
            )

        return not_verified


class Command(BaseCommand):

    def handle(self, *args, **kwargs):
        file_name = '{}/imports/FIN Transaction Detail - YTD plain text.xlsx' \
                .format(settings.BASE_DIR)
        file = File(open(file_name, 'rb'))
        wb = xlrd.open_workbook(file_contents=file.read())
        ws = wb.sheet_by_index(0)

        file_instance = models.TransactionFile.objects.create(
                file=file, comment="Import script")
        TransactionsFileHandler(ws, file_instance=file_instance).import_file()


