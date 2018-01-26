from django.urls import path

from api import views

urlpatterns = [
    # path('account/(?P<pk>[0-9]+)/$', views.TransactableView.as_view()),
    path('fund/', views.TransactableView.as_view()),
    path('test/', views.employee),
]

