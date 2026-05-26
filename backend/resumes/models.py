from django.db import models
from django.contrib.auth.models import User


class Resume(models.Model):
    FILE_TYPE_CHOICES = [
        ('pdf', 'PDF'),
        ('doc', 'DOC'),
        ('docx', 'DOCX'),
        ('text', 'Text'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='resumes')
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='resumes/', blank=True, null=True)
    file_type = models.CharField(max_length=10, choices=FILE_TYPE_CHOICES)
    raw_text = models.TextField(blank=True, null=True)
    extracted_text = models.TextField(blank=True, null=True)
    skills = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.title}"