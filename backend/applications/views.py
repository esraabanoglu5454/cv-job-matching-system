from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from rest_framework_simplejwt.authentication import JWTAuthentication
from matching.models import MatchResult
from jobs.models import Job
from resumes.models import Resume
from .models import JobApplication
from .serializers import EmployerApplicationSerializer
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from .serializers import MyApplicationSerializer

class ApplyJobView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, job_id):
        resume_id = request.data.get("resume_id")
        match_result_id = request.data.get("match_result_id")
        cover_note = request.data.get("cover_note", "")

        try:
            job = Job.objects.get(id=job_id)
        except Job.DoesNotExist:
            return Response(
                {"detail": "İş ilanı bulunamadı."},
                status=status.HTTP_404_NOT_FOUND
            )

        if job.user == request.user:
            return Response(
                {"detail": "Kendi ilanınıza başvuru yapamazsınız."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not resume_id:
            return Response(
                {"detail": "Başvuru için CV seçilmelidir."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            resume = Resume.objects.get(id=resume_id, user=request.user)
        except Resume.DoesNotExist:
            return Response(
                {"detail": "Seçilen CV bulunamadı."},
                status=status.HTTP_404_NOT_FOUND
            )

        match_result = None

        if match_result_id:
            try:
                match_result = MatchResult.objects.get(
                    id=match_result_id,
                    resume=resume,
                    job=job,
                )
            except MatchResult.DoesNotExist:
                return Response(
            {"detail": "Eşleşme sonucu bulunamadı. Lütfen tekrar eşleştirme başlatın."},
            status=status.HTTP_404_NOT_FOUND
        )

        existing_application = JobApplication.objects.filter(
            job=job,
            candidate=request.user
        ).first()

        if existing_application:
            existing_application.resume = resume
            existing_application.match_result = match_result
            existing_application.cover_note = cover_note
            existing_application.save()

            serializer = EmployerApplicationSerializer(
                existing_application,
                context={"request": request}
            )

            return Response(
                {
                    "detail": "Başvurunuz güncellendi.",
                    "application": serializer.data
                },
                status=status.HTTP_200_OK
            )

        application = JobApplication.objects.create(
            job=job,
            candidate=request.user,
            resume=resume,
            match_result=match_result,
            cover_note=cover_note
        )

        serializer = EmployerApplicationSerializer(
            application,
            context={"request": request}
        )

        return Response(
            {
                "detail": "Başvurunuz başarıyla alındı.",
                "application": serializer.data
            },
            status=status.HTTP_201_CREATED
        )


class EmployerApplicationListView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        applications = JobApplication.objects.filter(
            job__user=request.user
        ).select_related(
            "job",
            "candidate",
            "resume",
            "match_result"
        ).order_by("-created_at")

        serializer = EmployerApplicationSerializer(
            applications,
            many=True,
            context={"request": request}
        )

        return Response(serializer.data, status=status.HTTP_200_OK)


class CandidateApplicationListView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        applications = JobApplication.objects.filter(
            candidate=request.user
        ).select_related(
            "job",
            "candidate",
            "resume",
            "match_result"
        ).order_by("-created_at")

        serializer = EmployerApplicationSerializer(
            applications,
            many=True,
            context={"request": request}
        )

        return Response(serializer.data, status=status.HTTP_200_OK)
    
EmployerApplicationsView = EmployerApplicationListView


class MyApplicationsView(ListAPIView):
    serializer_class = MyApplicationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            JobApplication.objects
            .filter(candidate=self.request.user)
            .select_related("job", "resume", "match_result")
            .order_by("-created_at")
        )



class WithdrawApplicationView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def patch(self, request, application_id):
        try:
            application = JobApplication.objects.get(
                id=application_id,
                candidate=request.user
            )
        except JobApplication.DoesNotExist:
            return Response(
                {"detail": "Başvuru bulunamadı."},
                status=status.HTTP_404_NOT_FOUND
            )

        if application.status in ["accepted", "rejected"]:
            return Response(
                {"detail": "Sonuçlanmış başvuru geri çekilemez."},
                status=status.HTTP_400_BAD_REQUEST
            )

        application.status = "withdrawn"
        application.save()

        return Response(
            {
                "detail": "Başvuru geri çekildi.",
                "status": application.status,
            },
            status=status.HTTP_200_OK
        )

class UpdateApplicationStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, application_id):
        new_status = request.data.get("status")

        allowed_statuses = [
            "pending",
            "reviewed",
            "accepted",
            "rejected",
        ]

        if new_status not in allowed_statuses:
            return Response(
                {"detail": "Geçersiz başvuru durumu."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            application = JobApplication.objects.select_related("job").get(
                id=application_id
            )
        except JobApplication.DoesNotExist:
            return Response(
                {"detail": "Başvuru bulunamadı."},
                status=status.HTTP_404_NOT_FOUND
            )

        job_owner = (
            getattr(application.job, "user", None)
            or getattr(application.job, "employer", None)
            or getattr(application.job, "created_by", None)
        )

        if job_owner != request.user:
            return Response(
                {"detail": "Bu başvurunun durumunu değiştirme yetkiniz yok."},
                status=status.HTTP_403_FORBIDDEN
            )

        application.status = new_status
        application.save()

        return Response(
            {
                "detail": "Başvuru durumu güncellendi.",
                "status": application.status,
            },
            status=status.HTTP_200_OK
        )
