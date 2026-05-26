from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import RegisterSerializer, UserSerializer
from resumes.models import Resume
from jobs.models import Job
from matching.models import MatchResult
from django.shortcuts import redirect
from django.views import View
from urllib.parse import urlencode
from django.contrib.auth import authenticate, get_user_model
from django.conf import settings

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


User = get_user_model()


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username_or_email = request.data.get("username", "").strip()
        password = request.data.get("password", "")

        if not username_or_email or not password:
            return Response(
                {"detail": "Kullanıcı adı/e-posta ve şifre zorunludur."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Username veya email ile kullanıcı bul.
        # get() yerine filter().first() kullanıyoruz ki duplicate kayıt 500 üretmesin.
        user_obj = (
            User.objects
            .filter(username__iexact=username_or_email)
            .first()
        )

        if user_obj is None:
            user_obj = (
                User.objects
                .filter(email__iexact=username_or_email)
                .first()
            )

        if user_obj is None:
            return Response(
                {"detail": "Kullanıcı adı veya şifre hatalı."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        user = authenticate(
            request=request,
            username=user_obj.username,
            password=password
        )

        if user is None:
            return Response(
                {"detail": "Kullanıcı adı veya şifre hatalı."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            refresh = RefreshToken.for_user(user)
        except Exception as e:
            return Response(
                {"detail": f"Token oluşturulurken hata oluştu: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        user_type = getattr(user, "user_type", None) or "candidate"

        company_name = ""
        if user_type == "employer":
            employer_profile = getattr(user, "employerprofile", None)
            if employer_profile:
                company_name = getattr(employer_profile, "company_name", "") or ""

        return Response(
            {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user_type": user_type,
                "username": user.username,
                "email": user.email,
                "company_name": company_name,
            },
            status=status.HTTP_200_OK
        )


class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        resumes = Resume.objects.filter(user=user).order_by("-created_at")
        jobs = Job.objects.filter(user=user).order_by("-created_at")

        # Eski veya bozuk eşleşme kayıtları varsa 500 hatası vermemesi için güvenli alıyoruz.
        matches = (
            MatchResult.objects
            .filter(resume__user=user, resume__isnull=False, job__isnull=False)
            .select_related("resume", "job")
            .order_by("-created_at")
        )

        resume_data = []
        for cv in resumes:
            resume_data.append({
                "id": cv.id,
                "title": getattr(cv, "title", "") or "Başlıksız CV",
                "file_type": getattr(cv, "file_type", "") or "",
                "created_at": cv.created_at,
                "skills": getattr(cv, "skills", []) or [],
            })

        job_data = []
        for job in jobs:
            job_data.append({
                "id": job.id,
                "title": getattr(job, "title", "") or "Başlıksız İlan",
                "company_name": getattr(job, "company_name", "") or "",
                "location": getattr(job, "location", "") or "",
                "salary_range": getattr(job, "salary_range", "") or "",
                "created_at": job.created_at,
            })

        match_data = []
        for match in matches:
            try:
                match_data.append({
                    "id": match.id,
                    "resume_title": getattr(match.resume, "title", "") or "Başlıksız CV",
                    "job_title": getattr(match.job, "title", "") or "Başlıksız İlan",
                    "company_name": getattr(match.job, "company_name", "") or "",
                    "final_score": getattr(match, "final_score", 0) or 0,
                    "matched_skills": getattr(match, "matched_skills", []) or [],
                    "missing_skills": getattr(match, "missing_skills", []) or [],
                    "recommendation": getattr(match, "recommendation", "") or "",
                    "created_at": match.created_at,
                })
            except Exception:
                # Bozuk tek bir eşleşme kaydı tüm profil sayfasını düşürmesin.
                continue

        return Response({
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
            },
            "resumes": resume_data,
            "jobs": job_data,
            "matches": match_data,
        }, status=status.HTTP_200_OK)

class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")

        if not user.check_password(old_password):
            return Response(
                {"detail": "Eski şifre yanlış."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not new_password or len(new_password) < 4:
            return Response(
                {"detail": "Yeni şifre en az 4 karakter olmalı."},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(new_password)
        user.save()

        return Response({"detail": "Şifre başarıyla değiştirildi."}, status=status.HTTP_200_OK)


class DeleteAccountView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request):
        user = request.user
        user.delete()
        return Response({"detail": "Hesap silindi."}, status=status.HTTP_200_OK)
    

class SocialLoginRedirectView(View):
    def get(self, request):
        if not request.user.is_authenticated:
            frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:3000")
            return redirect(f"{frontend_url}/login?social_error=not_authenticated")
            # return redirect("http://localhost:3000/login?social_error=not_authenticated")

        user = request.user

        # Eğer user_type alanın varsa alıyoruz.
        # Yoksa varsayılan olarak candidate kabul ediyoruz.
        user_type = getattr(user, "user_type", "candidate") or "candidate"

        refresh = RefreshToken.for_user(user)

        query = urlencode({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user_type": user_type,
        })
        frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:3000")
        return redirect(f"{frontend_url}/social-login?{query}")

        # return redirect(f"http://localhost:3000/social-login?{query}")