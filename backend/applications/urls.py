from django.urls import path
from .views import EmployerApplicationsView, ApplyJobView, CandidateApplicationListView,MyApplicationsView, UpdateApplicationStatusView
from .views import WithdrawApplicationView
urlpatterns = [
    path("employer/", EmployerApplicationsView.as_view(), name="employer-applications"),
    path("candidate/", CandidateApplicationListView.as_view(), name="candidate-applications"),
    path("apply/<int:job_id>/", ApplyJobView.as_view(), name="apply-job"),
    path("my-applications/", MyApplicationsView.as_view(), name="my-applications"),
    path(
    "withdraw/<int:application_id>/",
    WithdrawApplicationView.as_view(),
    name="withdraw-application"
),
path(
    "status/<int:application_id>/",
    UpdateApplicationStatusView.as_view(),
    name="update-application-status"
),
]