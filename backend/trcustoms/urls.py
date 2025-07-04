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
from trcustoms.awards.views import AwardRecipientListView, AwardSpecListView
from trcustoms.community_events.views import EventViewSet
from trcustoms.config.views import ConfigViewSet, FeaturedLevelsView
from trcustoms.engines.views import EngineViewSet
from trcustoms.genres.views import (
    GenreDetailView,
    GenreListView,
    GenreStatsView,
)
from trcustoms.levels.views import LevelFileViewSet, LevelViewSet
from trcustoms.news.views import NewsViewSet
from trcustoms.playlists.views import PlaylistItemViewSet
from trcustoms.ratings.views import RatingViewSet
from trcustoms.reviews.views import ReviewViewSet
from trcustoms.tags.views import (
    TagDetailView,
    TagListView,
    TagMergeView,
    TagRetrieveByNameView,
    TagStatsView,
)
from trcustoms.uploads.views import UploadViewSet
from trcustoms.users.views import UserViewSet
from trcustoms.utils.views import as_detail_view, as_list_view, as_view
from trcustoms.walkthroughs.views import WalkthroughViewSet

router = DefaultRouter()
router.register(r"config", ConfigViewSet, basename="config")
router.register(r"users", UserViewSet)
router.register(r"news", NewsViewSet)
router.register(r"uploads", UploadViewSet, basename="uploads")
router.register(r"auditlogs", AuditLogViewSet, basename="auditlogs")
router.register(r"levels", LevelViewSet)
router.register(r"level_engines", EngineViewSet)
router.register(r"level_files", LevelFileViewSet)
router.register(r"reviews", ReviewViewSet)
router.register(r"ratings", RatingViewSet)
router.register(r"walkthroughs", WalkthroughViewSet)
router.register(r"events", EventViewSet)

urlpatterns = [
    path("api/auth/token/", TokenObtainPairView.as_view()),
    path("api/auth/token/refresh/", TokenRefreshView.as_view()),
    path(settings.ADMIN_DIR + "/", admin.site.urls),
    path("api/", include(router.urls)),
    path("api/level_genres/", GenreListView.as_view()),
    path("api/level_genres/<int:pk>/", GenreDetailView.as_view()),
    path("api/level_genres/<int:pk>/stats/", GenreStatsView.as_view()),
    path("api/level_tags/", TagListView.as_view()),
    path("api/level_tags/<int:pk>/", TagDetailView.as_view()),
    path(
        "api/level_tags/by_name/<str:name>/", TagRetrieveByNameView.as_view()
    ),
    path("api/level_tags/<int:pk>/merge/", TagMergeView.as_view()),
    path("api/level_tags/<int:pk>/stats/", TagStatsView.as_view()),
    path("api/config/featured_levels/", FeaturedLevelsView.as_view()),
    path(
        "api/users/<int:user_id>/playlist/", as_list_view(PlaylistItemViewSet)
    ),
    path(
        "api/users/<int:user_id>/playlist/<int:pk>/",
        as_detail_view(PlaylistItemViewSet),
    ),
    path(
        "api/users/<int:user_id>/playlist/import/",
        as_view(PlaylistItemViewSet, actions={"post": "import_"}),
    ),
    path(
        "api/users/<int:user_id>/playlist/by_level_id/<int:level_id>/",
        as_view(PlaylistItemViewSet, actions={"get": "by_level_id"}),
    ),
    path("api/award_specs/", AwardSpecListView.as_view()),
    path(
        "api/award_specs/<str:code>/recipients/",
        AwardRecipientListView.as_view(),
    ),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/swagger/", SpectacularSwaggerView.as_view(url_name="schema")),
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema")),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
