from django.core.management.base import BaseCommand
from django.db.models import Q

from api import models

class Command(BaseCommand):
    help = "Populates OverheadRate model with a single instance, must be run " \
            "after populate_accounts."

    def handle(self, *args, **kwargs):
        models.OverheadRate.objects.get_or_create(
                rate=models.OVERHEAD_RATE
            )

