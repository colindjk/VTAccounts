from django.urls import path

from api import views

urlpatterns = [
    path('fund/', views.FundByAccountView.as_view()),
]

