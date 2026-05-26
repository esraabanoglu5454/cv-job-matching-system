from django.db import models
from django.contrib.auth.models import User
from django.conf import settings

class UserProfile(models.Model):
    USER_TYPES = (
        ('candidate', 'Aday'),
        ('employer', 'İşveren'),
    )

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile'
    )

    user_type = models.CharField(
        max_length=20,
        choices=USER_TYPES,
        default='candidate'
    )

    phone = models.CharField(max_length=20, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.user_type}"


class EmployerProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='employer_profile'
    )

    company_name = models.CharField(max_length=255)
    sector = models.CharField(max_length=100, blank=True, null=True)
    company_description = models.TextField(blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    logo = models.ImageField(upload_to='company_logos/', blank=True, null=True)

    phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)

    is_verified = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.company_name
    
class CompanyProfile(models.Model):
    employer = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="company_profile"
    )

    company_name = models.CharField(max_length=255)
    sector = models.CharField(max_length=255, blank=True, default="")
    location = models.CharField(max_length=255, blank=True, default="")
    employee_count = models.CharField(max_length=100, blank=True, default="")
    description = models.TextField(blank=True, default="")
    website = models.URLField(blank=True, default="")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.company_name