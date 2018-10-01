
# Populates payperiods between the year 2010, to 2099.
class Command(BaseCommand):

    def handle(self, *args, **kwargs):
        for x in range(2010, 2099):
            models.PayPeriod.fiscal_year(x)


