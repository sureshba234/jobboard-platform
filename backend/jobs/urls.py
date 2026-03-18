from django.urls import path
from .views import (
    JobListView, JobDetailView,
    EmployerJobListView, BookmarkView, MyBookmarksView
)

urlpatterns = [
    path('',                        JobListView.as_view(),        name='job-list'),
    path('<int:pk>/',               JobDetailView.as_view(),       name='job-detail'),
    path('my/',                     EmployerJobListView.as_view(), name='employer-jobs'),
    path('<int:job_id>/bookmark/',  BookmarkView.as_view(),        name='bookmark'),
    path('bookmarks/',              MyBookmarksView.as_view(),     name='bookmarks'),
]