from django.db import models
from django.conf import settings
from jobs.models import Job
from resumes.models import Resume


class JobApplication(models.Model):
    STATUS_CHOICES = [
        ("pending", "Beklemede"),
        ("reviewed", "İncelendi"),
        ("accepted", "Kabul Edildi"),
        ("rejected", "Reddedildi"),
        ("withdrawn", "Geri Çekildi"),
    ]

    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name="job_applications",
    )

    candidate = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="job_applications",
    )

    resume = models.ForeignKey(
        Resume,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="job_applications",
    )

    match_result = models.ForeignKey(
        "matching.MatchResult",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="job_applications",
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending",
    )

    cover_note = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        unique_together = ("job", "candidate")

    def __str__(self):
        return f"{self.candidate.username} → {self.job.title}"