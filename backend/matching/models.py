from django.db import models
from resumes.models import Resume
from jobs.models import Job
from django.contrib.auth.models import User
from django.conf import settings

class MatchResult(models.Model):
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name='matches')
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='matches')
    semantic_score = models.FloatField(default=0.0)
    tfidf_score = models.FloatField(default=0.0)
    final_score = models.FloatField(default=0.0)
    matched_skills = models.JSONField(default=list, blank=True)
    missing_skills = models.JSONField(default=list, blank=True)
    recommendation = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('resume', 'job')

    def __str__(self):
        return f"{self.resume.title} <-> {self.job.title} = {self.final_score}"
    
class RecommendationHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="recommendation_histories")
    resume = models.ForeignKey("resumes.Resume", on_delete=models.CASCADE)
    job = models.ForeignKey("jobs.Job", on_delete=models.CASCADE)
    final_score = models.IntegerField(default=0)
    target_role = models.CharField(max_length=120, blank=True, null=True)
    recommendations = models.JSONField(default=list, blank=True)
    roadmap = models.JSONField(default=dict, blank=True)
    learning_time = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.resume.title} / {self.job.title}"


class LearningPlan(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="learning_plans")
    target_role = models.CharField(max_length=120)
    plan_data = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.target_role}"
class UserSkillProgress(models.Model):
    STATUS_CHOICES = [
        ("missing", "Eksik"),
        ("in_progress", "Devam Ediyor"),
        ("completed", "Tamamlandı"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="skill_progress")
    skill_name = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="missing")
    source = models.CharField(max_length=100, blank=True, null=True)  # udemy, coursera, manual
    notes = models.TextField(blank=True, null=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("user", "skill_name")

    def __str__(self):
        return f"{self.user.username} - {self.skill_name} - {self.status}"
