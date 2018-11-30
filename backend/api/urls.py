from django.urls import path, re_path
from rest_framework.routers import DefaultRouter

from api import views
from backend.views import UserLoginView

router = DefaultRouter()
router.register(r'payments', views.TransactionView, base_name='Payments')
router.register(r'salaries', views.SalaryView, base_name='Salaries')
router.register(r'fringes', views.FringeRateView, base_name='Fringe')
router.register(r'indirects', views.IndirectRateView, base_name='Indirect')

router.register(r'user/settings', views.UserSettingsView, base_name='settings')

router.register(r'files/transactions',
        views.TransactionFileView, base_name='imports')
router.register(r'files/salaries',
        views.SalaryFileView, base_name='imports')

urlpatterns = router.urls + [
    # User
    path('auth/', UserLoginView.as_view()),

    # Records (aggregate)
    path('payments/summary/transactable/', views.PaymentSummaryView.as_view()),
    path('payments/summary/fund/', views.FundSummaryView.as_view()),

    # Updatable
    path('funds/', views.FundList.as_view()),
    path('accounts/', views.AccountList.as_view()),
    path('employees/', views.EmployeeView.as_view(),),

]

