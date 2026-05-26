from django.contrib import admin
from .models import UserProfile, EmployerProfile


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "user_type", "phone", "created_at")
    list_filter = ("user_type", "created_at")
    search_fields = ("user__username", "user__email", "phone")


@admin.register(EmployerProfile)
class EmployerProfileAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "company_name", "sector", "location", "is_verified", "created_at")
    list_filter = ("is_verified", "sector", "created_at")
    search_fields = ("user__username", "user__email", "company_name", "sector", "location")
