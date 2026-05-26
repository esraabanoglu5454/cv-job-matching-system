from rest_framework import serializers
from .models import SavedJob


class SavedJobSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source="job.title", read_only=True)
    company_name = serializers.CharField(source="job.company_name", read_only=True)
    location = serializers.CharField(source="job.location", read_only=True)
    employment_type = serializers.CharField(source="job.employment_type", read_only=True)
    salary_range = serializers.CharField(source="job.salary_range", read_only=True)

    class Meta:
        model = SavedJob
        fields = [
            "id",
            "job",
            "job_title",
            "company_name",
            "location",
            "employment_type",
            "salary_range",
            "created_at",
        ]