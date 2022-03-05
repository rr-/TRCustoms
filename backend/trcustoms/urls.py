from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from trcustoms.audit_logs.views import AuditLogViewSet
from trcustoms.common.views import ConfigViewSet
from trcustoms.engines.views import EngineViewSet
from trcustoms.genres.views import GenreViewSet
from trcustoms.levels.views import LevelFileViewSet, LevelViewSet
from trcustoms.news.views import NewsViewSet
from trcustoms.reviews.views import LevelReviewViewSet
from trcustoms.tags.views import TagViewSet
from trcustoms.uploads.views import UploadViewSet
from trcustoms.users.views import UserViewSet

router = DefaultRouter()
router.register(r"config", ConfigViewSet, basename="config")
router.register(r"users", UserViewSet)
router.register(r"news", NewsViewSet)
router.register(r"uploads", UploadViewSet, basename="uploads")
router.register(r"auditlogs", AuditLogViewSet, basename="auditlogs")
router.register(r"levels", LevelViewSet)
router.register(r"level_tags", TagViewSet)
router.register(r"level_genres", GenreViewSet)
router.register(r"level_engines", EngineViewSet)
router.register(r"level_files", LevelFileViewSet)
router.register(r"reviews", LevelReviewViewSet)

urlpatterns = [
    path("api/auth/token/", TokenObtainPairView.as_view()),
    path("api/auth/token/refresh/", TokenRefreshView.as_view()),
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
