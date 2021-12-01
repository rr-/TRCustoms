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
    LevelEngineViewSet,
    LevelGenreViewSet,
    LevelTagViewSet,
    LevelViewSet,
    UserViewSet,
)

router = DefaultRouter()
router.register(r"users", UserViewSet)
router.register(r"levels", LevelViewSet)
router.register(r"level_tags", LevelTagViewSet)
router.register(r"level_genres", LevelGenreViewSet)
router.register(r"level_engines", LevelEngineViewSet)

urlpatterns = [
    path("api/auth/token/", TokenObtainPairView.as_view()),
    path("api/auth/token/refresh/", TokenRefreshView.as_view()),
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
