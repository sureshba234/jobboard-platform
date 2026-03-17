# backend/applications/urls.py

from django.urls import path
from .views import (
    ApplyView,
    MyApplicationsView,
    JobApplicationsView,
    UpdateApplicationStatusView,
    WithdrawApplicationView,
)

urlpatterns = [
    path('apply/',              ApplyView.as_view(),                  name='apply'),
    path('my/',                 MyApplicationsView.as_view(),         name='my-applications'),
    path('job/<int:job_id>/',   JobApplicationsView.as_view(),        name='job-applications'),
    path('<int:pk>/status/',    UpdateApplicationStatusView.as_view(), name='update-status'),
    path('<int:pk>/withdraw/',  WithdrawApplicationView.as_view(),    name='withdraw'),
]