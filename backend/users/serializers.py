from django.contrib.auth.models import User
from rest_framework import serializers
from .models import UserProfile, EmployerProfile
from .models import CompanyProfile

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    user_type = serializers.ChoiceField(
        choices=UserProfile.USER_TYPES,
        write_only=True
    )

    company_name = serializers.CharField(
        required=False,
        allow_blank=True,
        write_only=True
    )

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "password",
            "user_type",
            "company_name",
        ]

    def validate(self, attrs):
        user_type = attrs.get("user_type")
        company_name = attrs.get("company_name", "").strip()

        if user_type == "employer" and not company_name:
            raise serializers.ValidationError({
                "company_name": "İşveren hesabı için şirket adı zorunludur."
            })

        if User.objects.filter(username=attrs.get("username")).exists():
            raise serializers.ValidationError({
                "username": "Bu kullanıcı adı zaten kullanılıyor."
            })

        if attrs.get("email") and User.objects.filter(email=attrs.get("email")).exists():
            raise serializers.ValidationError({
                "email": "Bu e-posta adresi zaten kullanılıyor."
            })

        return attrs

    def create(self, validated_data):
        user_type = validated_data.pop("user_type")
        company_name = validated_data.pop("company_name", "").strip()
        password = validated_data.pop("password")

        user = User(**validated_data)
        user.set_password(password)
        user.save()

        UserProfile.objects.create(
            user=user,
            user_type=user_type
        )

        if user_type == "employer":
            EmployerProfile.objects.create(
                user=user,
                company_name=company_name
            )

        return user


class MeSerializer(serializers.ModelSerializer):
    user_type = serializers.SerializerMethodField()
    company_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "user_type",
            "company_name",
        ]

    def get_user_type(self, obj):
        if hasattr(obj, "profile"):
            return obj.profile.user_type
        return None

    def get_company_name(self, obj):
        if hasattr(obj, "employer_profile"):
            return obj.employer_profile.company_name
        return None

class CompanyProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyProfile
        fields = [
            "id",
            "company_name",
            "sector",
            "location",
            "employee_count",
            "description",
            "website",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]