from django.urls import path, re_path
from rest_framework.authtoken.views import obtain_auth_token
from rest_framework.routers import DefaultRouter

from api import views

router = DefaultRouter()
router.register(r'payments', views.PaymentView, base_name='payments')

urlpatterns = router.urls + [
    path('auth/', obtain_auth_token, name="auth"),

    path('transactables/', views.TransactableView.as_view(),),

    path('payments/summary/', views.PaymentSummaryView.as_view()),

    # path('fund/payments/', views)

    # From here we have basic list resources, almost one to one with models.
    path('funds/', views.FundList.as_view()),
    path('accounts/', views.AccountHierarchyList.as_view()),
    path('employees/', views.EmployeeView.as_view(),),

    # TODO: How do we retrieve salaries?
    # path('employees/salaries/')
]

