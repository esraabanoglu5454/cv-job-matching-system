from django.urls import path
from .views import  ResumeListView, ResumeUploadView, ResumeDeleteView


urlpatterns = [
    
    path('upload/', ResumeUploadView.as_view(), name='resume-upload'),
    path('my-resumes/', ResumeListView.as_view(), name='my-resumes'),
    path("delete/<int:pk>/", ResumeDeleteView.as_view(), name="resume-delete"),
]