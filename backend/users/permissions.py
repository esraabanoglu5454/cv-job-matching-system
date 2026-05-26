from rest_framework.permissions import BasePermission


class IsEmployer(BasePermission):
    message = "Bu işlemi yalnızca işveren kullanıcılar yapabilir."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and hasattr(request.user, "profile")
            and request.user.profile.user_type == "employer"
        )


class IsCandidate(BasePermission):
    message = "Bu işlemi yalnızca aday kullanıcılar yapabilir."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and hasattr(request.user, "profile")
            and request.user.profile.user_type == "candidate"
        )


class IsJobOwnerEmployer(BasePermission):
    message = "Bu ilan üzerinde yalnızca ilan sahibi işveren işlem yapabilir."

    def has_object_permission(self, request, view, obj):
        return (
            request.user
            and request.user.is_authenticated
            and hasattr(request.user, "profile")
            and request.user.profile.user_type == "employer"
            and obj.user == request.user
        )