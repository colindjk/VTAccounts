import os, sys, csv

from django.core.management.base import BaseCommand
from django.conf import settings
from random import randint

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

class Command(BaseCommand):

    def handle(self, *args, **kwargs):
        with open('{}/constants/accounts.csv'.format(
                  settings.BASE_DIR), 'rt') as f:
            reader = csv.reader(f)
            list_of_accounts = list(reader)
        
        print("Populating accounts...")
        for row in list_of_accounts:
            (type, _) = models.AccountType.objects.get_or_create(
                    code=row[0], name=row[1])
            (grou, _) = models.AccountGroup.objects.get_or_create(
                    type=type, code=row[2], name=row[3])
            (subg, _) = models.AccountSubGroup.objects.get_or_create(
                    group=grou, code=row[4], name=row[5])
            (clas, _) = models.AccountClass.objects.get_or_create(
                    sub_group=subg, code=row[6], name=row[7], is_loe=is_loe(row[6]))
            (obje, _) = models.AccountObject.objects.get_or_create(
                    account_class=clas, code=row[8], name=row[9])
            (acct, _) = models.Account.objects.get_or_create(
                    account_object=obje, code=row[10], name=row[11])
    
            type.save()
            grou.save()
            subg.save()
            clas.save()
            obje.save()
            acct.save()

