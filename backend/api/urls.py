from django.urls import path
from rest_framework.authtoken.views import obtain_auth_token

from api import views

urlpatterns = [
    path('auth/', obtain_auth_token, name="auth"),

    path('transactables/', views.TransactableView.as_view(),),
    path('employees/', views.EmployeeView.as_view(),),
]

