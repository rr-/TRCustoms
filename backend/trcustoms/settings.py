import os
import sys
from datetime import timedelta
from pathlib import Path


def get_setting(name: str) -> str:
    """Return a setting from the environment variables.

    Raises an error if the setting is not definied.
    """
    ret = os.environ.get(name)
    if ret is None:
        raise RuntimeError(f"Missing configuration variable {name}")
    return ret


BASE_DIR = Path(__file__).resolve().parent.parent
CACHE_DIR = BASE_DIR / "cache"

SECRET_KEY = get_setting("SECRET_KEY")
DEBUG = get_setting("DEBUG").lower() in {"1", "true"}
DEBUG_SQL = get_setting("DEBUG_SQL").lower() in {"1", "true"}
TESTING = any(arg.endswith("test") for arg in sys.argv)
ALLOWED_HOSTS = ["*"]

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "rest_framework_simplejwt",
    "django_unused_media",
    "django_cleanup.apps.CleanupConfig",
    "storages",
    "trcustoms.audit_logs",
    "trcustoms.common",
    "trcustoms.engines",
    "trcustoms.genres",
    "trcustoms.levels",
    "trcustoms.news",
    "trcustoms.reviews",
    "trcustoms.tags",
    "trcustoms.uploads",
    "trcustoms.users",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "trcustoms.common.middleware.TimezoneMiddleware",
]

ROOT_URLCONF = "trcustoms.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "filters": {
        "require_debug_true": {
            "()": "django.utils.log.RequireDebugTrue",
        }
    },
    "handlers": {
        "console": {
            "filters": None,
            "class": "logging.StreamHandler",
        },
        "sql_console": {
            "class": "logging.StreamHandler",
            "filters": ["require_debug_true"],
        },
    },
    "loggers": {
        "celery": {
            "level": "INFO",
            "handlers": ["console"],
        },
        "trcustoms": {
            "level": "DEBUG",
            "handlers": ["console"],
        },
        "django": {
            "level": "INFO",
            "handlers": ["console"],
        },
        "django.db.backends": {
            "level": "DEBUG" if DEBUG_SQL else "INFO",
            "handlers": ["sql_console"],
        },
    },
}

CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.redis.RedisCache",
        "LOCATION": "redis://trcustoms-redis:6379",
    }
}

WSGI_APPLICATION = "trcustoms.wsgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql_psycopg2",
        "NAME": get_setting("POSTGRES_DB"),
        "USER": get_setting("POSTGRES_USER"),
        "PASSWORD": get_setting("POSTGRES_PASSWORD"),
        "HOST": "trcustoms-db",
        "PORT": 5432,
    }
}

AUTHENTICATION_BACKENDS = ["trcustoms.users.authentication.CustomBackend"]

AUTH_USER_MODEL = "users.User"
AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "UserAttributeSimilarityValidator"
        ),
    },
    {
        "NAME": (
            "django.contrib.auth.password_validation.MinimumLengthValidator"
        ),
        "OPTIONS": {
            "min_length": 7,
        },
    },
    {
        "NAME": (
            "django.contrib.auth.password_validation.CommonPasswordValidator"
        ),
    },
    {
        "NAME": (
            "django.contrib.auth.password_validation.NumericPasswordValidator"
        )
    },
    {"NAME": "trcustoms.users.validators.PasswordLetterValidator"},
    {"NAME": "trcustoms.users.validators.PasswordDigitValidator"},
    {"NAME": "trcustoms.users.validators.PasswordSpecialCharValidator"},
]

REST_FRAMEWORK = {
    "DEFAULT_FILTER_BACKENDS": [
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "trcustoms.users.authentication.CustomAuthentication",
    ],
    "DEFAULT_THROTTLE_CLASSES": [
        "trcustoms.common.throttling.UnsafeOperationsRateThrottle"
    ],
    "DEFAULT_THROTTLE_RATES": {
        "unsafe_operations": "10/min",
    },
    "DEFAULT_PAGINATION_CLASS": "trcustoms.common.pagination.CustomPagination",
    "ORDERING_PARAM": "sort",
    "PAGE_SIZE": 20,
}

SIMPLE_JWT = {
    "UPDATE_LAST_LOGIN": True,
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=1),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=365),
    "USER_AUTHENTICATION_RULE": (
        "trcustoms.users.authentication.user_authentication_rule"
    ),
}

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_L10N = True
USE_TZ = True

USE_X_FORWARDED_HOST = True

STATIC_URL = "/django_static/"
STATICFILES_DIRS = [
    BASE_DIR / "trcustoms" / "static",
]
STATIC_ROOT = BASE_DIR / "django_static"

MEDIA_URL = "/uploads/"
MEDIA_ROOT = BASE_DIR / "uploads"

CELERY_BROKER_URL = "redis://trcustoms-redis:6379"
CELERY_RESULT_BACKEND = "redis://trcustoms-redis:6379"
CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_TIME_LIMIT = 30 * 60
CELERY_IMPORTS = ("trcustoms.tasks",)

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

HOST_SITE = get_setting("HOST_SITE").rstrip("/")
FILE_UPLOAD_DIRECTORY_PERMISSIONS = 0o755
FILE_UPLOAD_PERMISSIONS = 0o644

MIN_GENRES = 1
MAX_GENRES = 5
MIN_TAGS = 0
MAX_TAGS = 10
MIN_SCREENSHOTS = 3
MAX_SCREENSHOTS = 9
MIN_SHOWCASE_LINKS = 0
MAX_SHOWCASE_LINKS = 2
MIN_AUTHORS = 1
MAX_AUTHORS = 25
MAX_TAG_LENGTH = 20

EMAIL_HOST = get_setting("EMAIL_HOST")
EMAIL_PORT = int(get_setting("EMAIL_PORT"))
EMAIL_HOST_USER = get_setting("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = get_setting("EMAIL_HOST_PASSWORD")
EMAIL_USE_TLS = get_setting("EMAIL_USE_TLS") == "1"
EMAIL_USE_SSL = get_setting("EMAIL_USE_SSL") == "1"

AWS_ACCESS_KEY_ID = get_setting("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = get_setting("AWS_SECRET_ACCESS_KEY")
AWS_STORAGE_BUCKET_NAME = get_setting("AWS_STORAGE_BUCKET_NAME")
AWS_S3_CUSTOM_DOMAIN = f"{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com"
AWS_S3_OBJECT_PARAMETERS = {"CacheControl": "max-age=86400"}
AWS_MEDIA_LOCATION = "media"
USE_AWS_STORAGE = get_setting("USE_AWS_STORAGE").lower() in {
    "1",
    "true",
    "y",
    "yes",
}

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:8000",
    "https://trcustoms.org",
    "https://staging.trcustoms.org",
]


if TESTING:
    del REST_FRAMEWORK["DEFAULT_THROTTLE_CLASSES"]
    del REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"]
