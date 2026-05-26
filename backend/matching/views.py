from httpx import request
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from rest_framework_simplejwt.authentication import JWTAuthentication
from resumes.models import Resume
from jobs.models import Job
from .models import MatchResult, RecommendationHistory, LearningPlan
from .serializers import MatchRequestSerializer
from .utils import calculate_skill_match, generate_recommendation
from rest_framework.generics import RetrieveAPIView
from rest_framework.exceptions import PermissionDenied
from .serializers import MatchResultSerializer
from .recommendation_engine import (
    generate_recommendations,
    detect_target_role,
    build_role_roadmap,
    build_weighted_job_skills,
    split_required_optional_skills,
    estimate_learning_time,
    enrich_courses_with_search_links,
    build_learning_plan,
)
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import UserSkillProgress
from .serializers import UserSkillProgressSerializer
from .models import RecommendationHistory
from .models import LearningPlan

class MatchResumeJobView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = MatchRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        resume_id = serializer.validated_data["resume_id"]
        job_id = serializer.validated_data["job_id"]

        try:
            resume = Resume.objects.get(id=resume_id, user=request.user)
        except Resume.DoesNotExist:
            return Response({"detail": "Resume bulunamadı."}, status=status.HTTP_404_NOT_FOUND)

        try:
            job = Job.objects.get(id=job_id)
        except Job.DoesNotExist:
           return Response({"detail": "Job bulunamadı."}, status=status.HTTP_404_NOT_FOUND)

        resume_text = resume.extracted_text or resume.raw_text or ""
        job_text = f"""
        {job.title or ""}
        {job.description or ""}
        {getattr(job, "required_skills", "") or ""}
        {getattr(job, "optional_skills", "") or ""}
        """.strip()
        

        match_data = calculate_skill_match(resume_text, job_text, request.user)
        
        target_role = detect_target_role(job.title or "", job_text)

        skill_groups = split_required_optional_skills(match_data["job_skills"],job_text,)

        weighted_skills = build_weighted_job_skills(
            match_data["job_skills"],
            job_text
       )

        raw_recommendations = generate_recommendations(
            missing_skills=match_data["missing_skills"],
            weighted_job_skills=weighted_skills
    )

        raw_recommendations = enrich_courses_with_search_links(raw_recommendations)

        roadmap = build_role_roadmap(target_role, match_data["resume_skills"])

        learning_time = estimate_learning_time(
            match_data["missing_skills"],
            skill_groups["required_skills"],
            skill_groups["optional_skills"],
            match_data["job_skills"],
        )

        learning_plan = build_learning_plan(
            target_role,
            raw_recommendations,
            roadmap,
            match_data["missing_skills"],
        )

        normalized_recommendations = []

        for item in raw_recommendations:
            skill_name = item.get("skill", "Beceri")
            priority = item.get("priority") or item.get("importance_score") or "Orta"

            normalized_recommendations.append({
                "skill": skill_name,
                "priority": priority,
                "course": item.get("course") or item.get("suggested_course") or f"{skill_name} için başlangıç kursu",
                "duration": item.get("duration") or "2-4 hafta",
                "level": item.get("level") or "Başlangıç / Orta",
                "impact": item.get("impact") or f"{target_role} rolüne uyumu artırır.",
                "target_roles": item.get("target_roles") or ([target_role] if target_role else []),
                "roadmap": item.get("roadmap") or [
                    f"{skill_name} temellerini öğren",
                    f"{skill_name} ile küçük bir proje geliştir",
                    f"{skill_name} bilgisini CV ve portföyde göster",
                ],
            })

        recommendations = normalized_recommendations

        recommendation = generate_recommendation(
            match_data["missing_skills"],
            final_score=match_data.get("score", 0),
            job_skills=match_data.get("job_skills", []),
        )
        match_result, created = MatchResult.objects.update_or_create(
              resume=resume,
              job=job,
              defaults={
                  "final_score": match_data.get("score", 0),
                  "matched_skills": match_data.get("matched_skills", []),
                  "missing_skills": match_data.get("missing_skills", []),
                  "recommendation": recommendation,
                
              },
          )

        RecommendationHistory.objects.filter(
            user=request.user,
            resume=resume,
            job=job,
        ).delete()

        RecommendationHistory.objects.create(
            user=request.user,
            resume=resume,
            job=job,
            final_score=match_data["score"],
            target_role=target_role,
            recommendations=recommendations,
            roadmap=roadmap,
            learning_time=learning_time,
        )

        LearningPlan.objects.filter(
            user=request.user,
            target_role=target_role,
        ).delete()

        LearningPlan.objects.create(
            user=request.user,
            target_role=target_role,
            plan_data=learning_plan,
        )

        return Response({
        "id": match_result.id,
        "match_id": match_result.id,
        "resume_id": resume.id,
        "job_id": job.id,
        "resume_skills": match_data.get("resume_skills", []),
        "job_skills": match_data.get("job_skills", []),
        "matched_skills": match_data.get("matched_skills", []),
        "missing_skills": match_data.get("missing_skills", []),
        "skill_score": match_data.get("skill_score", 0),
        "semantic_score": match_data.get("semantic_score", 0),
        "final_score": match_data.get("score", 0),
        "recommendation": recommendation,

        "required_skills": skill_groups.get("required_skills", []),
        "optional_skills": skill_groups.get("optional_skills", []),
        "recommendations": recommendations,
        "roadmap": roadmap,
        "learning_time": learning_time,
        "learning_plan": learning_plan,
        "target_role": target_role,

        "resume_text_preview": resume_text[:500],
        "job_text_preview": job_text[:500],
        "completed_by_user": match_data.get("completed_by_user", []),
        "completed_required": match_data.get("completed_required", []),
        "completed_optional": match_data.get("completed_optional", []),
        "bonus_score": match_data.get("bonus_score", 0),
    })

class MatchResultDetailView(RetrieveAPIView):
    serializer_class = MatchResultSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "pk"

    def get_queryset(self):
        return MatchResult.objects.select_related("job", "resume", "resume__user")

    def get_object(self):
        obj = super().get_object()

        if obj.resume.user != self.request.user:
            raise PermissionDenied("Bu eşleşme sonucunu görme yetkiniz yok.")

        return obj

class MyMatchResultsView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        matches = MatchResult.objects.filter(resume__user=request.user).order_by("-created_at")

        data = []
        for match in matches:
            data.append({
                "id": match.id,
                "resume_title": match.resume.title,
                "job_title": match.job.title,
                "company_name": match.job.company_name,
                "final_score": match.final_score,
                "matched_skills": match.matched_skills,
                "missing_skills": match.missing_skills,
                "recommendation": match.recommendation,
                "created_at": match.created_at,
            })

        return Response(data, status=status.HTTP_200_OK)
    
class RecommendationHistoryListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        histories = RecommendationHistory.objects.filter(user=request.user).order_by("-created_at")
        data = []
        for item in histories:
            data.append({
                "id": item.id,
                "resume_title": item.resume.title,
                "job_title": item.job.title,
                "final_score": item.final_score,
                "target_role": item.target_role,
                "recommendations": item.recommendations,
                "learning_time": item.learning_time,
                "created_at": item.created_at,
            })
        return Response(data, status=status.HTTP_200_OK)


class LearningPlanListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        plans = LearningPlan.objects.filter(user=request.user).order_by("-created_at")
        data = []
        for item in plans:
            data.append({
                "id": item.id,
                "target_role": item.target_role,
                "plan_data": item.plan_data,
                "created_at": item.created_at,
            })
        return Response(data, status=status.HTTP_200_OK)
    
class SkillProgressListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        skills = UserSkillProgress.objects.filter(user=request.user).order_by("skill_name")
        serializer = UserSkillProgressSerializer(skills, many=True)
        return Response(serializer.data)

    def post(self, request):
        skill_name = request.data.get("skill_name")
        status_value = request.data.get("status", "completed")
        source = request.data.get("source", "manual")
        notes = request.data.get("notes", "")

        if not skill_name:
            return Response({"detail": "skill_name gerekli."}, status=status.HTTP_400_BAD_REQUEST)

        obj, created = UserSkillProgress.objects.update_or_create(
            user=request.user,
            skill_name=skill_name.strip().lower(),
            defaults={
                "status": status_value,
                "source": source,
                "notes": notes,
                "completed_at": timezone.now() if status_value == "completed" else None,
            },
        )

        serializer = UserSkillProgressSerializer(obj)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

class SkillProgressUpdateDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, skill_name):
        try:
            obj = UserSkillProgress.objects.get(user=request.user, skill_name=skill_name.strip().lower())
        except UserSkillProgress.DoesNotExist:
            return Response({"detail": "Kayıt bulunamadı."}, status=status.HTTP_404_NOT_FOUND)

        status_value = request.data.get("status", obj.status)
        obj.status = status_value
        obj.completed_at = timezone.now() if status_value == "completed" else None
        obj.save()

        serializer = UserSkillProgressSerializer(obj)
        return Response(serializer.data)

    def delete(self, request, skill_name):
        try:
            obj = UserSkillProgress.objects.get(user=request.user, skill_name=skill_name.strip().lower())
        except UserSkillProgress.DoesNotExist:
            return Response({"detail": "Kayıt bulunamadı."}, status=status.HTTP_404_NOT_FOUND)

        obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class DeleteMatchResultView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, match_id):
        try:
            match = MatchResult.objects.get(id=match_id)
        except MatchResult.DoesNotExist:
            return Response(
                {"detail": "Eşleşme kaydı bulunamadı."},
                status=status.HTTP_404_NOT_FOUND,
            )

        
        if hasattr(match, "resume") and match.resume.user != request.user:
            return Response(
                {"detail": "Bu kaydı silme yetkiniz yok."},
                status=status.HTTP_403_FORBIDDEN,
            )

        match.delete()
        return Response(
            {"detail": "Eşleşme kaydı silindi."},
            status=status.HTTP_204_NO_CONTENT,
        )

class DeleteRecommendationHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, history_id):
        try:
            item = RecommendationHistory.objects.get(id=history_id, user=request.user)
        except RecommendationHistory.DoesNotExist:
            return Response(
                {"detail": "Öneri geçmişi bulunamadı."},
                status=status.HTTP_404_NOT_FOUND,
            )

        item.delete()
        return Response(
            {"detail": "Öneri geçmişi silindi."},
            status=status.HTTP_204_NO_CONTENT,
        )

class DeleteRecommendationHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, history_id):
        try:
            item = RecommendationHistory.objects.get(id=history_id, user=request.user)
        except RecommendationHistory.DoesNotExist:
            return Response(
                {"detail": "Öneri geçmişi bulunamadı."},
                status=status.HTTP_404_NOT_FOUND,
            )

        item.delete()
        return Response(
            {"detail": "Öneri geçmişi silindi."},
            status=status.HTTP_204_NO_CONTENT,
        )
    
class DeleteLearningPlanView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, plan_id):
        try:
            plan = LearningPlan.objects.get(id=plan_id, user=request.user)
        except LearningPlan.DoesNotExist:
            return Response(
                {"detail": "Öğrenme planı bulunamadı."},
                status=status.HTTP_404_NOT_FOUND,
            )

        plan.delete()
        return Response(
            {"detail": "Öğrenme planı silindi."},
            status=status.HTTP_204_NO_CONTENT,
        )
    
class EmployerMatchDetailView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, match_id):
        try:
            match = MatchResult.objects.select_related(
                "resume",
                "job",
                "resume__user",
                "job__user"
            ).get(id=match_id)
        except MatchResult.DoesNotExist:
            return Response(
                {"detail": "Eşleşme sonucu bulunamadı."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Güvenlik: Sadece ilanın sahibi olan işveren görebilsin.
        if match.job.user != request.user:
            return Response(
                {"detail": "Bu eşleşme sonucunu görme yetkiniz yok."},
                status=status.HTTP_403_FORBIDDEN
            )

        data = {
            "id": match.id,
            "final_score": match.final_score,
            "semantic_score": getattr(match, "semantic_score", 0),
            "tfidf_score": getattr(match, "tfidf_score", 0),
            "matched_skills": match.matched_skills or [],
            "missing_skills": match.missing_skills or [],
            "recommendation": match.recommendation or "",
            "created_at": match.created_at,

            "job": {
                "id": match.job.id,
                "title": match.job.title,
                "company_name": match.job.company_name,
                "location": match.job.location,
            },

            "candidate": {
                "id": match.resume.user.id,
                "username": match.resume.user.username,
                "email": match.resume.user.email,
            },

            "resume": {
                "id": match.resume.id,
                "title": match.resume.title,
            },
        }

        return Response(data, status=status.HTTP_200_OK)

class EmployerMatchResultDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            match = MatchResult.objects.select_related(
                "job",
                "resume",
                "resume__user",
            ).get(id=pk)
        except MatchResult.DoesNotExist:
            return Response(
                {"detail": "Eşleşme sonucu bulunamadı."},
                status=status.HTTP_404_NOT_FOUND,
            )

        job_owner = (
            getattr(match.job, "user", None)
            or getattr(match.job, "employer", None)
            or getattr(match.job, "created_by", None)
        )

        if job_owner != request.user:
            return Response(
                {"detail": "Bu eşleşme sonucunu görme yetkiniz yok."},
                status=status.HTTP_403_FORBIDDEN,
            )

        data = {
            "id": match.id,
            "final_score": match.final_score,
            "matched_skills": match.matched_skills or [],
            "missing_skills": match.missing_skills or [],
            "recommendation": match.recommendation or "",
            "created_at": match.created_at,

            "job": {
                "id": match.job.id,
                "title": match.job.title,
                "company_name": match.job.company_name,
                "location": match.job.location,
            },

            "candidate": {
                "id": match.resume.user.id,
                "username": match.resume.user.username,
                "email": match.resume.user.email,
            },

            "resume": {
                "id": match.resume.id,
                "title": getattr(match.resume, "title", "") or "CV",
            },
        }

        return Response(data, status=status.HTTP_200_OK)