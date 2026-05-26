from django.urls import path
from .views import MatchResumeJobView, MyMatchResultsView,RecommendationHistoryListView,LearningPlanListView,EmployerMatchDetailView
from .views import SkillProgressListCreateView, SkillProgressUpdateDeleteView
from .views import DeleteMatchResultView, DeleteRecommendationHistoryView,DeleteLearningPlanView
from .views import MatchResultDetailView, EmployerMatchResultDetailView

urlpatterns = [
    path('run/', MatchResumeJobView.as_view()),
    path('results/', MyMatchResultsView.as_view()),
    path("recommendation-history/", RecommendationHistoryListView.as_view(), name="recommendation-history"),
    path("learning-plans/", LearningPlanListView.as_view(), name="learning-plans"),
    path("skill-progress/", SkillProgressListCreateView.as_view(), name="skill-progress-list-create"),
    path("skill-progress/<str:skill_name>/", SkillProgressUpdateDeleteView.as_view(), name="skill-progress-update-delete"),
    path("delete-match/<int:match_id>/", DeleteMatchResultView.as_view(), name="delete-match"),
    path("result/<int:pk>/", MatchResultDetailView.as_view(), name="match-result-detail"),
    path("employer-result/<int:pk>/", EmployerMatchResultDetailView.as_view(), name="employer-match-result-detail"),
    path(
    "recommendation-history/<int:history_id>/delete/",
    DeleteRecommendationHistoryView.as_view(),
    name="delete-recommendation-history",),
    path(
    "learning-plans/<int:plan_id>/delete/",
    DeleteLearningPlanView.as_view(),
    name="delete-learning-plan",
),
    path("employer-result/<int:match_id>/", EmployerMatchDetailView.as_view(), name="employer-match-detail"),
]