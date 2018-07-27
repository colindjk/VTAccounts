from django.core.management.base import BaseCommand
from django.db.models import Q

from api import models

def get_non_indirect_accounts():
    parent_queryset = models.AccountBase.objects.none()

    parent_queryset |= models.AccountBase.objects.filter(
        Q(account_level="account_sub_group") & Q(
        Q(code="140", name="Stipends and Other Awards") |
        Q(code="210", name="Property and Improvements Bgt") |
        Q(code="220", name="Equipment Budget") |
        Q(code="230", name="Plant and Improvements Budget")))

    parent_queryset |= models.AccountBase.objects.filter(
        Q(account_level="account") & Q(
        Q(code="1244D", name="Cont Ed Workshop Support to OSP") |
        Q(code="14220", name="Student Loans") |
        Q(code="14230", name="Tuition & Training Aids") |
        Q(code="14240", name="Tuition Waiver") |
        Q(code="14241", name="Tuition Waiver-Aux Chrg Allocation") |
        Q(code="14247", name="Tuition Remission - Unfunded Waiver") |
        Q(code="14248", name="Tuition Remission - E&G Waivers") |
        Q(code="14250", name="Undergraduate Scholarships") |
        Q(code="14251", name="Undergraduates Sch - Matching") |
        Q(code="14252", name="Undergraduate Scholarships-Clearing") |
        Q(code="15210", name="Computer Capital Leases") |
        Q(code="15220", name="Central Processor Capital Leases") |
        Q(code="15230", name="Computer Software Capital Leases") |
        Q(code="15240", name="Equipment Capital Leases") |
        Q(code="15250", name="Building Capital Leases") |
        Q(code="15260", name="Land Capital Leases") |
        Q(code="15270", name="Land & Building Capital Leases") |
        Q(code="15310", name="Computer Rentals (not mainframe)") |
        Q(code="15320", name="Computer Processor Rentals") |
        Q(code="15330", name="Computer Software Rentals") |
        Q(code="15340", name="Other Equipment Rentals") |
        Q(code="15341", name="Audio-Visual Equip. Rental") |
        Q(code="15342", name="Conference Microcomputer Rentals") |
        Q(code="15343", name="Inter-library loans") |
        Q(code="15345", name="Vehicle Rentals") |
        Q(code="1534G", name="Equip Rentals - Game Day") |
        Q(code="1534U", name="Equip Rent  - Unallowable") |
        Q(code="15352", name="Audio-Visual Equip. Rental") |
        Q(code="15353", name="Conference Microcomputer Rentals") |
        Q(code="15350", name="Building Rentals") |
        Q(code="15351", name="Meeting Facilities Rentals") |
        Q(code="15355", name="Facility Use Agreements") |
        Q(code="15356", name="Building Rentals-Security Deposit") |
        Q(code="15357", name="CESA Student Housing Expenses") |
        Q(code="15358", name="Mini-storage Unit Rentals") |
        Q(code="15359", name="Shared CESA Facility Expenses") |
        Q(code="1535U", name="Bldg Rent - Unallowable") |
        Q(code="15360", name="Land Rentals") |
        Q(code="15361", name="Land Rentals Partial Use") |
        Q(code="1536U", name="Land Rent - Unallowable") |
        Q(code="15370", name="Land and Building Rentals") |
        Q(code="1537U", name="Land & Bldg Rent – Unallowable")))

    queryset = models.AccountBase.objects.none()

    for account in parent_queryset:
        queryset |= account.get_descendants(include_self=True)

    return queryset

def get_indirect_accounts():
    non_indirect = get_non_indirect_accounts()
    return models.AccountBase.objects.exclude(id__in=non_indirect)

class Command(BaseCommand):
    help = "Populates IndirectRate model, must be run after populate_accounts."

    def handle(self, *args, **kwargs):
        indirect = get_indirect_accounts()
        indirect_dest = models.AccountBase.objects.get(**INDIRECT_ACCOUNT_KWARGS)
        overhead_dest = models.AccountBase.objects.get(**OVERHEAD_ACCOUNT_KWARGS)
        indirect_rate, icreated = models.IndirectRate.objects.get_or_create(
                destination_account=indirect_dest)
        overhead_rate, ocreated = models.OverheadRate.objects.get_or_create(
                destination_account=overhead_dest)
        print("Indirect: {}", indirect_rate.__dict__)
        for account in indirect:
            indirect_rate.source_accounts.add(account)
            overhead_rate.source_accounts.add(account)
            
        indirect_rate.save()

        # rates = models.AssociatedRate.objects.all().select_subclasses()
        # for rate in rates:
            # account = rate.destination_account
            # t, c = models.Transactable.objects.get_or_create(
                    # parent_account=account,
                    # name=rate.NAME_FORMAT.format(account.name),
                    # code="Man. {}".format(account.code))
            # print("Transactable: {}, {}".format(t, c))


    # def __init__(self, *args, **kwargs):
        # if not kwargs.get('destination_account', None):
            # kwargs['destination_account'] = AccountBase.objects.get(
                # **INDIRECT_ACCOUNT_KWARGS)
        # super(IndirectRate, self).__init__(*args, **kwargs)

    # Get the default OverheadRate instance by calling `get_or_create()`.
    # Allows for possibility of adding multiple OverheadRate accounts.
    # def __init__(self, *args, **kwargs):
        # if not kwargs.get('destination_account', None):
            # kwargs['destination_account'] = AccountBase.objects.get(
                # **OVERHEAD_ACCOUNT_KWARGS)
        # super(OverheadRate, self).__init__(*args, **kwargs)

