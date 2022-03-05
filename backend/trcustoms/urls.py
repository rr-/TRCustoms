from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from trcustoms.views.audit_logs import AuditLogViewSet
from trcustoms.views.config import ConfigViewSet
from trcustoms.views.level_engines import LevelEngineViewSet
from trcustoms.views.level_files import LevelFileViewSet
from trcustoms.views.level_genres import LevelGenreViewSet
from trcustoms.views.level_reviews import LevelReviewViewSet
from trcustoms.views.level_tags import LevelTagViewSet
from trcustoms.views.levels import LevelViewSet
from trcustoms.views.news import NewsViewSet
from trcustoms.views.uploads import UploadViewSet
from trcustoms.views.users import UserViewSet

router = DefaultRouter()
router.register(r"config", ConfigViewSet, basename="config")
router.register(r"users", UserViewSet)
router.register(r"news", NewsViewSet)
router.register(r"uploads", UploadViewSet, basename="uploads")
router.register(r"auditlogs", AuditLogViewSet, basename="auditlogs")
router.register(r"levels", LevelViewSet)
router.register(r"level_tags", LevelTagViewSet)
router.register(r"level_genres", LevelGenreViewSet)
router.register(r"level_engines", LevelEngineViewSet)
router.register(r"level_files", LevelFileViewSet)
router.register(r"reviews", LevelReviewViewSet)

urlpatterns = [
    path("api/auth/token/", TokenObtainPairView.as_view()),
    path("api/auth/token/refresh/", TokenRefreshView.as_view()),
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
