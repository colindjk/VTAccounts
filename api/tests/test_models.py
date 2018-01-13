from django.test import TestCase

from api import models

def create_employees(num_employees):
    for num in range(num_employees):
        models.Employee.objects.create(first_name="{}_first".format(num),
                               last_name="{}_last".format(num),
                               pid=1000)

def create_transactables(num_employees):
    models.EmployeeTransactable.create(
            first_name="{}_first".format(num),
            last_name="{}_last".format(num),
            pid=1000)

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
        create_employees(5)
        
    def setUp(self):
        pass

class TestTransaction(TestCase):

    @classmethod
    def setUpTestData(cls):
        create_employees(5)
        
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

class SalaryVerificationTest(TestCase):

    @classmethod
    def setUpTestData(cls):
        models.PayPeriod.fiscal_year(2017)
        account = models.AccountType.objects.create(name="EXAMPLE_TYPE",
                    code="1", is_loe=True)
        account.save()
        a = models.Transactable.objects.create(name="Last, First 1000",
                    code="NONE", parent_account=account)
        b = models.Transactable.objects.create(name="Last, Fran  2000",
                    code="NONE", parent_account=account)
        c = models.Transactable.objects.create(name="Last, Filly 3000",
                code="NONE", parent_account=account)
        a.save()
        b.save()
        c.save()

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
