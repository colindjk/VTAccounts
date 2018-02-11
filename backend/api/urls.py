from django.urls import path, re_path
from rest_framework.authtoken.views import obtain_auth_token

from api import views

payment_view = views.PaymentView.as_view(actions={'get': 'list'})
urlpatterns = [
    path('auth/', obtain_auth_token, name="auth"),

    path('transactables/', views.TransactableView.as_view(),),
    path('employees/', views.EmployeeView.as_view(),),

    # PATCH requests take structure { fund, transactable, pay_period, ... }
    # GET requests must provide start_date, end_date, and fund_id params.
    path('payments/', views.PaymentView.as_view(actions={'get': 'list'})),
    path('payments/summary/', views.PaymentSummaryView.as_view()),

    # From here we have basic list resources, almost one to one with models.
    # path('funds/'),
    # path('funds/<int:fund_id>/'),

    # path('accounts/')
    # path('accounts/<int:parent_id>/')

    # path('employees/')
    # path('employees/<int:employee_id>/')
    # path('employees/salaries/')
]

