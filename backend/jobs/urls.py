from django.urls import path
from .views import JobCreateView, JobDetailView, JobListView, JobDeleteView, PublicJobListView, MyJobsView
urlpatterns = [
    path('create/', JobCreateView.as_view(), name="job-create"),
    path("my-jobs/", MyJobsView.as_view(), name="my-jobs"),
    path("delete/<int:pk>/", JobDeleteView.as_view(), name="job-delete"),
    path("public/", PublicJobListView.as_view(), name="public-jobs"),
    path("<int:pk>/", JobDetailView.as_view(), name="job-detail"),
]