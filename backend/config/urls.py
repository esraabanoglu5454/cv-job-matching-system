from django.contrib import admin
from django.http import HttpResponse
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static


def home(request):
    return HttpResponse("Backend is running successfully.")


urlpatterns = [
    path('', home),
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/resumes/', include('resumes.urls')),
    path('api/jobs/', include('jobs.urls')),
    path('api/matching/', include('matching.urls')),
    path("api/users/", include("users.urls")),
    path("api/applications/", include("applications.urls")),
    path("accounts/", include("allauth.urls")),
    path("api/saved-jobs/", include("saved_jobs.urls")),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)