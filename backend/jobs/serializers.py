from rest_framework import serializers
from .models import Job


class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        # fields = '__all__'
        fields = [
            "id",
            "user",
            "title",
            "company_name",
            "description",
            "required_skills",
            "optional_skills",
            "location",
            "employment_type",
            "salary_range",
            "created_at",
        ]
        read_only_fields = ['user', 'created_at']
   
   
        