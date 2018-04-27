from django.urls import path, re_path
from rest_framework.authtoken.views import obtain_auth_token
from rest_framework.routers import DefaultRouter

from api import views

router = DefaultRouter()
router.register(r'payments', views.TransactionView, base_name='payments')
router.register(r'salaries', views.SalaryView, base_name='salaries')

urlpatterns = router.urls + [
    path('auth/', obtain_auth_token, name="auth"),

    path('transactions/import/', views.TransactionFileView.as_view()),

    path('payments/summary/transactable/', views.PaymentSummaryView.as_view()),
    path('payments/summary/fund/', views.FundSummaryView.as_view()),

    # From here we have basic list resources, almost one to one with models.
    path('funds/', views.FundList.as_view()),
    path('accounts/', views.AccountList.as_view()),
    path('employees/', views.EmployeeView.as_view(),),

]

