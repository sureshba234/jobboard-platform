# backend/jobs/urls.py

from django.urls import path
from .views import JobListView, JobDetailView, EmployerJobListView

urlpatterns = [
    path('',            JobListView.as_view(),         name='job-list'),
    path('<int:pk>/',   JobDetailView.as_view(),        name='job-detail'),
    path('my/',         EmployerJobListView.as_view(),  name='employer-jobs'),
]