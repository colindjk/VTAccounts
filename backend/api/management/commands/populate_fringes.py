import os, sys, csv
import xlrd

from django.core.management.base import BaseCommand
from django.conf import settings

from api import models, fields

class FringeRateData(object):

    # Takes a single line as input, which an array where each element pertains
    # to a value.
    def __init__(self, ws, row):
        # Use strip & split to remove whitespace and decimal.
        self.destination_code = str(ws.cell_value(row, 0)).strip().split(".")[0]
        self.source_code = str(ws.cell_value(row, 1)).strip().split(".")[0]
        self.rate = float(ws.cell_value(row, 2)) / 100
        self.year = int(ws.cell_value(row, 3))

class FringeRateFileHandler(object):
    def __init__(self, ws, file_instance=None):
        self.ws = ws
        self.file_instance = file_instance

    def import_file(self):
        iter_rows = range(1, self.ws.nrows).__iter__()

        for row_idx in iter_rows:
            data = FringeRateData(self.ws, row_idx)
            destination_account = models.Account.objects.filter(
                    code=data.destination_code).first()
            source_account = models.Account.objects.filter(
                    code=data.source_code).first()
            source_account.fringe_destination = destination_account
            source_account.save()

            pay_period = fields.pay_period_from_year(data.year)

            fringe_rate, _created = models.FringeRate.objects.get_or_create(
                        rate=data.rate,
                        pay_period=pay_period,
                        account=destination_account
                    )
            fringe_rate.save()

class Command(BaseCommand):
    help = "Populates FringeRate model with provided values which are " \
            "assigned to account_instance level accounts. This command " \
            "must be run after populate_accounts."

    def handle(self, *args, **kwargs):
        wb = xlrd.open_workbook(
                '{}/imports/constants/fringe_rates.xlsx'
                .format(settings.BASE_DIR))

        ws = wb.sheet_by_index(0)

        print("Populating fringe rates...")

        FringeRateFileHandler(ws).import_file()

