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

    @staticmethod
    def import_file_path(path):
        wb = xlrd.open_workbook(path)
        SalaryFileHandler.import_file(wb)

    @staticmethod
    def import_file(wb):
        models.Employee.objects.all().delete()
        models.EmployeeTransactable.objects.all().delete()
        # models.EmployeeTransactable.objects.all().delete()
        for salary_row in SalaryIterator(wb):
            models.EmployeeTransactable.objects.get_from_salary(salary_row)

class Command(BaseCommand):

    def handle(self, *args, **kwargs):
        SalaryFileHandler.import_file_path(
                '{}/imports/salary_verification/salary_verification 18.xlsx'
                .format(settings.BASE_DIR))

