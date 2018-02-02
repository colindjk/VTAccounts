import datetime
import xlrd

from django.core.management.base import BaseCommand
from django.conf import settings

from api import models

class InvalidFormatError(Exception):
    pass

class SalaryIterator(object):

    class SalaryData(object):
        def __init__(self, ws, row):
            # Excel stores data in float format, therefore upon reading an
            # integer (i.e. pid) we must convert to `int` before `str`.
            self.category               = str(ws.cell_value(row, 0))
            self.full_name              = str(ws.cell_value(row, 1))
            self.pid                    = str(int(ws.cell_value(row, 2)))
            self.org_code               = str(int(ws.cell_value(row, 3)))
            self.full_position_number   = str(ws.cell_value(row, 4))
            self.begin_date             = str(ws.cell_value(row, 5))
            self.fund_id                = str(ws.cell_value(row, 7))
            self.fund_name              = str(ws.cell_value(row, 8))
            self.loe                    = float(ws.cell_value(row, 9))
            self.salary                 = float(ws.cell_value(row, 10))
            self.total_salary           = float(ws.cell_value(row, 11))
            self.ppay                   = float(ws.cell_value(row, 12))
            self.total_ppay             = float(ws.cell_value(row, 13))

    def __init__(self, file):
        self.ws = file.sheet_by_index(0)

    def __iter__(self):
        start_row_idx = -1
        for i in range(self.ws.nrows):
            if "Category" in self.ws.cell_value(i, 0):
                start_row_idx = i + 1
                break
        if start_row_idx == -1:
            raise InvalidFormatError("Could not find beginning of salary file")
        self.start = start_row_idx
        self.end = self.ws.nrows
        self.cur_row = start_row_idx
        return self

    def __next__(self):
        if self.cur_row >= self.end:
            raise StopIteration
        data = self.SalaryData(self.ws, self.cur_row)
        self.cur_row += 1
        return data

class SalaryFileHandler(object):

    def __init__(self, pay_period):
        self.pay_period = pay_period

    def import_file_path(self, path):
        wb = xlrd.open_workbook(path)
        self.import_file(wb)

    def import_file(self, wb):
        for salary_row in SalaryIterator(wb):
            if salary_row.loe == 0:
                continue
            emp = models.EmployeeTransactable.objects.get_from_salary_data(
                    salary_row)
            if emp is None:
                continue
            (s, c) = models.EmployeeSalary.objects.get_or_create(
                    pay_period=self.pay_period,
                    employee=emp,
                    defaults={
                            "total_ppay": salary_row.total_ppay
                        }
                    )
            if c:
                print(s)



class Command(BaseCommand):
    help = 'Takes a file as input, as well as a date. \n' \
           '`import_salaries <filename> <date>`\n'

    def handle(self, *args, **kwargs):
        pay_period = models.PayPeriod.get_by_date(2017, 2, 15)
        print(pay_period.start_date)
        SalaryFileHandler(pay_period).import_file_path(
                '{}/imports/salary_verification/salary_verification 18.xlsx'
                .format(settings.BASE_DIR))

