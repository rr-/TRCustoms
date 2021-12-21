import os
from pathlib import Path


def get_setting(name: str) -> str:
    """Return a setting from the environment variables.

    Raises an error if the setting is not definied.
    """
    ret = os.environ.get(name)
    if not ret:
        raise RuntimeError(f"Missing configuration variable {name}")
    return ret


BASE_DIR = Path(__file__).resolve().parent.parent
CACHE_DIR = BASE_DIR / "cache"

SECRET_KEY = get_setting("SECRET_KEY")
DEBUG = get_setting("DEBUG").lower() in {"1", "true"}
ALLOWED_HOSTS = ["*"]

INSTALLED_APPS = [
    "trcustoms",
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
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "trcustoms.middleware.TimezoneMiddleware",
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
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
        },
    },
    "loggers": {
        "trcustoms": {
            "handlers": ["console"],
            "level": "DEBUG",
        },
    },
}


WSGI_APPLICATION = "trcustoms.wsgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql_psycopg2",
        "NAME": get_setting("POSTGRES_DB"),
        "USER": get_setting("POSTGRES_USER"),
        "PASSWORD": get_setting("POSTGRES_PASSWORD"),
        "HOST": "db",
        "PORT": 5432,
    }
}

AUTH_USER_MODEL = "trcustoms.User"
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
    {"NAME": "trcustoms.validators.PasswordLetterValidator"},
    {"NAME": "trcustoms.validators.PasswordDigitValidator"},
    {"NAME": "trcustoms.validators.PasswordSpecialCharValidator"},
]

REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "DEFAULT_PAGINATION_CLASS": "trcustoms.pagination.CustomPagination",
    "ORDERING_PARAM": "sort",
    "PAGE_SIZE": 20,
}

SIMPLE_JWT = {
    "UPDATE_LAST_LOGIN": True,
}

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_L10N = True
USE_TZ = True

STATIC_URL = "/django_static/"
STATICFILES_DIRS = [
    BASE_DIR / "trcustoms" / "static",
]
STATIC_ROOT = BASE_DIR / "django_static"

MEDIA_URL = "/uploads/"
MEDIA_ROOT = BASE_DIR / "uploads"

CELERY_BROKER_URL = "redis://redis:6379"
CELERY_RESULT_BACKEND = "redis://redis:6379"
CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_TIME_LIMIT = 30 * 60
CELERY_IMPORTS = ("trcustoms.tasks",)

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

HOST_SITE = get_setting("HOST_SITE")
FILE_UPLOAD_PERMISSIONS = 0o644

MAX_TAGS = 10
MAX_GENRES = 5
