from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from trcustoms.views import (
    ConfigViewSet,
    LevelEngineViewSet,
    LevelFileViewSet,
    LevelGenreViewSet,
    LevelReviewViewSet,
    LevelTagViewSet,
    LevelViewSet,
    UploadViewSet,
    UserViewSet,
)

router = DefaultRouter()
router.register(r"config", ConfigViewSet, basename="config")
router.register(r"users", UserViewSet)
router.register(r"uploads", UploadViewSet, basename="uploads")
router.register(r"levels", LevelViewSet)
router.register(r"level_tags", LevelTagViewSet)
router.register(r"level_reviews", LevelReviewViewSet)
router.register(r"level_genres", LevelGenreViewSet)
router.register(r"level_engines", LevelEngineViewSet)
router.register(r"level_files", LevelFileViewSet)

urlpatterns = [
    path("api/auth/token/", TokenObtainPairView.as_view()),
    path("api/auth/token/refresh/", TokenRefreshView.as_view()),
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
