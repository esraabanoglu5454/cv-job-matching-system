from django.urls import path
from .views import RegisterView, MeView
from .views import MyCompanyProfileView, PublicCompanyProfileView
urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("me/", MeView.as_view(), name="me"),
    path("company-profile/", MyCompanyProfileView.as_view(), name="my-company-profile"),
    path("company-profile/public/",PublicCompanyProfileView.as_view(),name="public-company-profile"),
]