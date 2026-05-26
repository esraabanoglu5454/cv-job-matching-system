from rest_framework import serializers
from .models import UserSkillProgress
from .models import MatchResult


class MatchResultSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source="job.title", read_only=True)
    company_name = serializers.CharField(source="job.company_name", read_only=True)
    job_location = serializers.CharField(source="job.location", read_only=True)

    resume_title = serializers.SerializerMethodField()
    candidate_username = serializers.SerializerMethodField()
    candidate_email = serializers.SerializerMethodField()

    class Meta:
        model = MatchResult
        fields = [
            "id",
            "job",
            "job_title",
            "company_name",
            "job_location",
            "resume",
            "resume_title",
            "candidate_username",
            "candidate_email",
            "final_score",
            "matched_skills",
            "missing_skills",
            "recommendation",
            "created_at",
        ]

    def get_resume_title(self, obj):
        resume = getattr(obj, "resume", None)

        if not resume:
            return None

        if hasattr(resume, "title") and resume.title:
            return resume.title

        if hasattr(resume, "name") and resume.name:
            return resume.name

        if hasattr(resume, "file") and resume.file:
            return resume.file.name.split("/")[-1]

        return "CV"

def get_candidate_username(self, obj):
    if obj.resume and obj.resume.user:
        return obj.resume.user.username
    return ""

def get_candidate_email(self, obj):
    if obj.resume and obj.resume.user:
        return obj.resume.user.email
    return ""


class UserSkillProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSkillProgress
        fields = "__all__"
        read_only_fields = ["user", "created_at", "updated_at"]

class MatchRequestSerializer(serializers.Serializer):
    resume_id = serializers.IntegerField()
    job_id = serializers.IntegerField()