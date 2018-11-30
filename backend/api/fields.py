import datetime
from django.db.models import DateField

from psycopg2.extras import DateRange

PAY_PERIOD_START_A = 10
PAY_PERIOD_START_B = 25

# Verifies that the pay period ends in either a 10 or a 25.
def pay_period_validator(value):
    day = value.day
    if day is not PAY_PERIOD_START_A or day is not PAY_PERIOD_START_B:
        raise ValidationError(
            "Pay period {} is not a valid start date.".format(value)
        )

# Extentions of DateField with a default pay_period validator.
class PayPeriodField(DateField):

    def __init__(self, *args, **kwargs):
        defaults = { 'validators': [pay_period_validator] }
        defaults.update(kwargs)
        return super(PayPeriodField, self).__init__(*args, **defaults)

    # Add this in case database validation is added via postgres 'domain'.
    # def db_type(self, connection): return 'pay_period'

# Helper function 
def pay_period_range(date):
    year = date.year
    month = date.month
    day = date.day
    a = PAY_PERIOD_START_A
    b = PAY_PERIOD_START_B
    date_from = None
    date_to = None
    if a <= day < b:
        date_from = datetime.date(year, month, a)
        date_to = datetime.date(year, month, b)
    elif day >= b:
        next_year = year + 1 if month is 12 else year
        next_month = 1 if month is 12 else month + 1
        date_from = datetime.date(year, month, b)
        date_to = datetime.date(next_year, next_month, a)
    elif day < a:
        prev_year = year - 1 if month is 1 else year
        prev_month = 12 if month is 1 else month - 1
        date_from = datetime.date(prev_year, prev_month, b)
        date_to = datetime.date(year, month, a)
    return DateRange(
            date_from.strftime("%Y-%m-%d"),
            date_to.strftime("%Y-%m-%d")
        )

# Returns first pay_period in the FISCAL year.
def pay_period_from_year(y):
    return datetime.date(y, 6, 25)

# This works, trust me.
def pay_period_from_date(d):
    return datetime.date(*[int(x) for x in pay_period_range(d).lower.split('-')])

# Allows user to get pay_period from a pay_period number.
# num : between range(1, 24, '[]'), raises an exception otherwise.
def pay_period_from_num(y, num):
    a = PAY_PERIOD_START_A
    b = PAY_PERIOD_START_B
    if not 1 <= num <= 24:
        raise ValueError("Invalid pay period number '{}' given.".format(num))
    PAY_PERIODS = [(y - 1, 12, b), (y, 1, a), (y, 1, b), (y, 2, a),
            (y, 2, b), (y, 3, a), (y, 3, b), (y, 4, a), (y, 4, b),
            (y, 5, a), (y, 5, b), (y, 6, a), (y, 6, b), (y, 7, a),
            (y, 7, b), (y, 8, a), (y, 8, b), (y, 9, a), (y, 9, b),
            (y, 10, a), (y, 10, b), (y, 11, a), (y, 11, b), (y, 12, a)]
    return datetime.date(*PAY_PERIODS[num - 1])

# Takes a date found in the YYYY-MM-DD format and returns the associated
# daterange value.
def pay_period_from_iso(iso):
    [y, m, d] = [int(x) for x in iso.split('-')]
    return pay_period_from_date(datetime.date(y, m, d))

