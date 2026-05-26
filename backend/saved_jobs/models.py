from django.db import models
from django.conf import settings
from jobs.models import Job


class SavedJob(models.Model):
    candidate = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="saved_jobs"
    )
    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name="saved_by_candidates"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        unique_together = ("candidate", "job")

    def __str__(self):
        return f"{self.candidate.username} - {self.job.title}"
