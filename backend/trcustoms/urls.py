from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from trcustoms.audit_logs.views import AuditLogViewSet
from trcustoms.config.views import ConfigViewSet
from trcustoms.engines.views import EngineViewSet
from trcustoms.genres.views import GenreViewSet
from trcustoms.levels.views import LevelFileViewSet, LevelViewSet
from trcustoms.news.views import NewsViewSet
from trcustoms.playlists.views import PlaylistItemViewSet
from trcustoms.reviews.views import LevelReviewViewSet
from trcustoms.tags.views import TagViewSet
from trcustoms.uploads.views import UploadViewSet
from trcustoms.users.views import UserViewSet
from trcustoms.utils.views import as_detail_view, as_list_view
from trcustoms.walkthroughs.views import WalkthroughViewSet

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
router.register(r"walkthroughs", WalkthroughViewSet)

urlpatterns = [
    path("api/auth/token/", TokenObtainPairView.as_view()),
    path("api/auth/token/refresh/", TokenRefreshView.as_view()),
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
    path(
        "api/users/<int:user_id>/playlist/",
        as_list_view(PlaylistItemViewSet),
        name="user-playlist-list",
    ),
    path(
        "api/users/<int:user_id>/playlist/<int:pk>/",
        as_detail_view(PlaylistItemViewSet),
        name="user-playlist-detail",
    ),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/swagger/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path(
        "api/redoc/",
        SpectacularRedocView.as_view(url_name="schema"),
        name="redoc-ui",
    ),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
