from django.db import models
from django.contrib.auth.models import User

EMPLOYMENT_TYPES = (
    ("Tam Zamanlı", "Tam Zamanlı"),
    ("Yarı Zamanlı", "Yarı Zamanlı"),
    ("Staj", "Staj"),
    ("Uzaktan", "Uzaktan"),
    ("Hibrit", "Hibrit"),
    ("Ofis", "Ofis"),
)


class Job(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    company_name = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    employment_type = models.CharField(max_length=100)
    salary_range = models.CharField(max_length=100, blank=True, null=True)
    description = models.TextField()
    sector = models.CharField(max_length=100, blank=True, null=True)  # EKLE
    created_at = models.DateTimeField(auto_now_add=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    district = models.CharField(max_length=100, blank=True, null=True)
    sector = models.CharField(max_length=100, blank=True, null=True)

    EXPERIENCE_LEVELS = (
        ('intern', 'Stajyer'),
        ('junior', 'Junior'),
        ('mid', 'Mid-Level'),
        ('senior', 'Senior'),
    )

    STATUS_CHOICES = (
        ('draft', 'Taslak'),
        ('published', 'Yayında'),
        ('closed', 'Kapalı'),
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='jobs'
    )

    title = models.CharField(max_length=255)
    company_name = models.CharField(max_length=255)

    description = models.TextField()
    responsibilities = models.TextField(blank=True, null=True)
    qualifications = models.TextField(blank=True, null=True)

    # required_skills = models.JSONField(default=list)
    # optional_skills = models.JSONField(default=list, blank=True, null=True)
    required_skills = models.TextField(blank=True, null=True)
    optional_skills = models.TextField(blank=True, null=True)

    location = models.CharField(max_length=255, blank=True, null=True)
    employment_type = models.CharField(
        max_length=50,
        choices=EMPLOYMENT_TYPES,
        default='full_time'
    )

    experience_level = models.CharField(
        max_length=50,
        choices=EXPERIENCE_LEVELS,
        default='junior'
    )

    salary_range = models.CharField(max_length=100, blank=True, null=True)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='published'
    )

    is_active = models.BooleanField(default=True)

    application_deadline = models.DateField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.company_name}"