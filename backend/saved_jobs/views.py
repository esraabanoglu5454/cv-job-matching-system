from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, DestroyAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from jobs.models import Job
from .models import SavedJob
from .serializers import SavedJobSerializer


class MySavedJobsView(ListAPIView):
    serializer_class = SavedJobSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            SavedJob.objects
            .filter(candidate=self.request.user)
            .select_related("job", "candidate")
            .order_by("-created_at")
        )


class SaveJobView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, job_id):
        try:
            job = Job.objects.get(id=job_id)
        except Job.DoesNotExist:
            return Response(
                {"detail": "İlan bulunamadı."},
                status=status.HTTP_404_NOT_FOUND
            )

        saved_job, created = SavedJob.objects.get_or_create(
            candidate=request.user,
            job=job
        )

        serializer = SavedJobSerializer(saved_job)
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )


class DeleteSavedJobView(DestroyAPIView):
    serializer_class = SavedJobSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SavedJob.objects.filter(candidate=self.request.user)