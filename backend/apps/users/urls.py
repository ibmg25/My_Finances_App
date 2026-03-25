from django.urls import path
from .views import RegisterView, MeView

urlpatterns = [
    path('users/register/', RegisterView.as_view(), name='user-register'),
    path('users/me/', MeView.as_view(), name='user-me'),
]
