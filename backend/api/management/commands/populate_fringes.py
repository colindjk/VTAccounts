import os, sys, csv
import xlrd

from django.core.management.base import BaseCommand
from django.conf import settings

from api import models

class FringeRateData(object):

    # Takes a single line as input, which an array where each element pertains
    # to a value.
    def __init__(self, ws, row):
        # Use strip & split to remove whitespace and decimal.
        self.destination_code = str(ws.cell_value(row, 0)).strip().split(".")[0]
        self.source_code = str(ws.cell_value(row, 1)).strip().split(".")[0]
        self.rate = float(ws.cell_value(row, 2))
        self.year = str(ws.cell_value(row, 3)).split(".")[0]

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

            fringe_rate, _created = models.FringeRate.objects.get_or_create(
                        destination_account=destination_account
                    )
            fringe_rate.source_accounts.add(source_account)
            fringe_rate.rates[data.year] = data.rate / 100
            fringe_rate.save()
            print(fringe_rate.__dict__)
            
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

