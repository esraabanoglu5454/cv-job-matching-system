from rest_framework import serializers
from .models import JobApplication


class EmployerApplicationSerializer(serializers.ModelSerializer):
    job_title = serializers.SerializerMethodField()
    candidate_username = serializers.SerializerMethodField()
    candidate_email = serializers.SerializerMethodField()
    resume_title = serializers.SerializerMethodField()
    resume_file_url = serializers.SerializerMethodField()
    match_id = serializers.SerializerMethodField()
    match_score = serializers.SerializerMethodField()

    class Meta:
        model = JobApplication
        fields = [
            "id",
            "job_title",
            "candidate_username",
            "candidate_email",
            "resume_title",
            "resume_file_url",
            "match_id",
            "match_score",
            "status",
            "cover_note",
            "created_at",
        ]

    def get_job_title(self, obj):
        return getattr(obj.job, "title", "") if obj.job else ""

    def get_candidate_username(self, obj):
        return getattr(obj.candidate, "username", "") if obj.candidate else ""

    def get_candidate_email(self, obj):
        return getattr(obj.candidate, "email", "") if obj.candidate else ""

    def get_resume_title(self, obj):
        return getattr(obj.resume, "title", "") if obj.resume else ""

    def get_resume_file_url(self, obj):
        request = self.context.get("request")

        if not obj.resume:
            return None

        possible_file_fields = ["file", "cv_file", "resume_file", "document"]

        for field_name in possible_file_fields:
            file_field = getattr(obj.resume, field_name, None)

            if file_field:
                try:
                    url = file_field.url
                    if request:
                        return request.build_absolute_uri(url)
                    return url
                except Exception:
                    continue

        return None

    def get_match_id(self, obj):
        if obj.match_result:
            return obj.match_result.id
        return None

    def get_match_score(self, obj):
        if obj.match_result:
            return getattr(obj.match_result, "final_score", None)
        return None
class MyApplicationSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source="job.title", read_only=True)
    company_name = serializers.CharField(source="job.company_name", read_only=True)
    location = serializers.CharField(source="job.location", read_only=True)
    employment_type = serializers.CharField(source="job.employment_type", read_only=True)
    salary_range = serializers.CharField(source="job.salary_range", read_only=True)

    resume_title = serializers.SerializerMethodField()
    match_score = serializers.SerializerMethodField()

    class Meta:
        model = JobApplication
        fields = [
            "id",
            "job",
            "job_title",
            "company_name",
            "location",
            "employment_type",
            "salary_range",
            "resume",
            "resume_title",
            "match_result",
            "match_score",
            "status",
            "cover_note",
            "created_at",
        ]

    def get_resume_title(self, obj):
        if not obj.resume:
            return None

        if hasattr(obj.resume, "title") and obj.resume.title:
            return obj.resume.title

        if hasattr(obj.resume, "name") and obj.resume.name:
            return obj.resume.name

        if hasattr(obj.resume, "file") and obj.resume.file:
            return obj.resume.file.name.split("/")[-1]

        return "CV"

    def get_match_score(self, obj):
        if not obj.match_result:
            return None

        if hasattr(obj.match_result, "final_score"):
            return obj.match_result.final_score

        if hasattr(obj.match_result, "score"):
            return obj.match_result.score

        if hasattr(obj.match_result, "match_score"):
            return obj.match_result.match_score

        return None



class ApplicationSerializer(EmployerApplicationSerializer):
    pass