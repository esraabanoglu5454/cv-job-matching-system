from django.urls import path
from .views import MySavedJobsView, SaveJobView, DeleteSavedJobView

urlpatterns = [
    path("my-saved-jobs/", MySavedJobsView.as_view(), name="my-saved-jobs"),
    path("save/<int:job_id>/", SaveJobView.as_view(), name="save-job"),
    path("<int:pk>/delete/", DeleteSavedJobView.as_view(), name="delete-saved-job"),
]