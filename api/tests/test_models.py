from django.test import TestCase

from api import models

def create_employee_transactables(num_employees):
    for num in range(num_employees):
        models.EmployeeTransactable.create(
                first_name="{}_first".format(num),
                last_name="{}_last".format(num),
                pid=1000)

# This class will test methods related to creating Employee, Transactable, and
# EmployeeTransactable, instances. 
class TestEmployeeCreation(TestCase):
    @classmethod
    def setUpTestData(cls):
        pass
    def setUp(self):
        pass

class TestTransaction(TestCase):

    # TODO: What do we call the created transactables?
    # TODO: How do we tell peeps about the created transactables...
    @classmethod
    def setUpTestData(cls):
        models.PayPeriod.fiscal_year(2017)
        models.PayPeriod.fiscal_year(2018)
        models.PayPeriod.fiscal_year(2019)
        models.PayPeriod.fiscal_year(2020)
        account = models.AccountType.objects.create(name="EXAMPLE", code="1")

    def setUp(self):
        pass

    def test_transaction_basic(self):
        pass

    def test_transaction_create_indirect(self):
        pass

    def test_transaction_create_fringe(self):
        pass

    def test_transaction_update_indirect(self):
        pass

    def test_transaction_update_fringe(self):
        pass

# Verifies creation of Employee AND EmployeeTransactable instances. 
class SalaryVerificationTest(TestCase):

    def generate_salaries():
        for i in range(10):
            pp_salary = {
                    "Category": "TR Faculty",

            }

    @classmethod
    def setUpTestData(cls):
        models.PayPeriod.fiscal_year(2017)
        account_a = models.AccountType.objects.create(name="EXAMPLE_TYPE",
                    code="1", is_loe=True)
        account_b = models.AccountType.objects.create(name="EXAMPLE_TYPE",
                    code="2", is_loe=True)
        account_a.save()
        account_b.save()

    def setUp(self):
        pass

    def test_transactable_upgrade(self):
        employees = models.EmployeeTransactable.objects.all().order_by(
                'position_number')
        self.assertEqual(len(employees), 3)
        a = employees.first()
        self.assertEquals(a.position_number, '1000')
        self.assertEquals(a.first_name, 'First')

    def test_salary_import_basic(self):
        pass


    # category = ws.cell_value(curr_row, CATEGORY_IDX)
    # (first, last) = parse_name(ws.cell_value(curr_row, NAME_IDX))
    # id = int(ws.cell_value(curr_row, ID_IDX))
    # position_number = ws.cell_value(curr_row, POSITION_IDX)
    # salary = float(ws.cell_value(curr_row, PAYPERIOD_SALARY_IDX))
