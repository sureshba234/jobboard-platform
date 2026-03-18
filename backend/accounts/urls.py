# backend/accounts/urls.py

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, CustomTokenObtainPairView, MeView,CompanyProfileView

urlpatterns = [
    path('register/',      RegisterView.as_view(),              name='register'),
    path('login/',         CustomTokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(),          name='token_refresh'),
    path('me/',            MeView.as_view(),                    name='me'),
    path('company/<int:employer_id>/', CompanyProfileView.as_view(), name='company-profile'),

]  