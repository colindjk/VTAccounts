import os, sys, csv
import xlrd

from django.core.management.base import BaseCommand
from django.core.files import File
from django.conf import settings

from api import models

def is_loe(code):
    if code == '1120':
        pass
    elif code == '1130':
        pass
    elif code == '1135':
        pass
    elif code == '1180':
        pass
    elif code == '1160':
        pass
    else:
        return False
    return True

def is_non_indirect(code):
    pass

# Add the accts... Check Brian's email and DO IT.

def is_fringe(code):
    pass

def is_indirect(code):
    pass

class Command(BaseCommand):

    def handle(self, *args, **kwargs):
        file = File(open('{}/imports/constants/accounts.xlsx'.format(
            settings.BASE_DIR), 'rb'))
        
        wb = xlrd.open_workbook(file_contents=file.read())
        ws = wb.sheet_by_index(0)

        print("Populating accounts...")
        iter_rows = range(1, ws.nrows).__iter__()
        for row in iter_rows:
            (type, _) = models.AccountType.objects.get_or_create(
                    code=ws.cell_value(row, 0),
                    name=ws.cell_value(row, 1))
            (grou, _) = models.AccountGroup.objects.get_or_create(
                    type=type,
                    code=ws.cell_value(row, 2),
                    name=ws.cell_value(row, 3))
            (subg, _) = models.AccountSubGroup.objects.get_or_create(
                    group=grou,
                    code=ws.cell_value(row, 4),
                    name=ws.cell_value(row, 5))
            (clas, _) = models.AccountClass.objects.get_or_create(
                    sub_group=subg,
                    code=ws.cell_value(row, 6),
                    name=ws.cell_value(row, 7),
                    is_loe=is_loe(ws.cell_value(row, 6)))
            (obje, _) = models.AccountObject.objects.get_or_create(
                    account_class=clas,
                    code=ws.cell_value(row, 8),
                    name=ws.cell_value(row, 9))
            (acct, _) = models.Account.objects.get_or_create(
                    account_object=obje,
                    code=ws.cell_value(row, 10),
                    name=ws.cell_value(row, 11))
    
            type.save()
            grou.save()
            subg.save()
            clas.save()
            obje.save()
            acct.save()

