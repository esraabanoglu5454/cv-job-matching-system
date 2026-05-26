from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import AllowAny
from rest_framework.generics import RetrieveAPIView
from .models import Job 
from .serializers import JobSerializer
from users.permissions import IsEmployer

class JobCreateView(generics.CreateAPIView):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated, IsEmployer]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class JobListView(generics.ListAPIView):
    serializer_class = JobSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Job.objects.all().order_by("-created_at")
    
class PublicJobListView(generics.ListAPIView):
    serializer_class = JobSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Job.objects.all().order_by("-created_at")


class EmployerJobListView(generics.ListAPIView):
    serializer_class = JobSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated, IsEmployer]

    def get_queryset(self):
        return Job.objects.filter(user=self.request.user).order_by("-created_at")


class JobDeleteView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated, IsEmployer]

    def delete(self, request, pk):
        try:
            job = Job.objects.get(id=pk, user=request.user)
        except Job.DoesNotExist:
            return Response(
                {"detail": "İş ilanı bulunamadı veya bu ilanı silme yetkiniz yok."},
                status=status.HTTP_404_NOT_FOUND
            )

        job.delete()
        return Response(
            {"detail": "İş ilanı silindi."},
            status=status.HTTP_200_OK
        )

class MyJobsView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        jobs = Job.objects.filter(user=request.user).order_by("-created_at")
        serializer = JobSerializer(jobs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class JobDetailView(RetrieveAPIView):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    permission_classes = [AllowAny]