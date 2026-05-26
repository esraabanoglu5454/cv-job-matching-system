from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth.models import User
from .serializers import RegisterSerializer, MeSerializer

from rest_framework import status
from .models import CompanyProfile
from .serializers import CompanyProfileSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = MeSerializer(request.user)
        return Response(serializer.data)
    
class MyCompanyProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile, created = CompanyProfile.objects.get_or_create(
            employer=request.user,
            defaults={
                "company_name": getattr(request.user, "company_name", "")
                or request.user.username
            }
        )

        serializer = CompanyProfileSerializer(profile)
        return Response(serializer.data)

    def patch(self, request):
        profile, created = CompanyProfile.objects.get_or_create(
            employer=request.user,
            defaults={
                "company_name": getattr(request.user, "company_name", "")
                or request.user.username
            }
        )

        serializer = CompanyProfileSerializer(
            profile,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class PublicCompanyProfileView(APIView):
    permission_classes = []

    def get(self, request):
        company_name = request.query_params.get("company_name", "").strip()

        if not company_name:
            return Response(
                {"detail": "company_name parametresi zorunludur."},
                status=status.HTTP_400_BAD_REQUEST
            )

        profile = CompanyProfile.objects.filter(
            company_name__iexact=company_name
        ).first()

        if not profile:
            return Response(
                {"detail": "Şirket profili bulunamadı."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = CompanyProfileSerializer(profile)
        return Response(serializer.data)