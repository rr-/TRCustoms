from django.contrib import admin

from trcustoms.audit_logs.mixins import AuditLogAdminMixin
from trcustoms.ratings.logic import get_rating_score
from trcustoms.ratings.models import (
    Rating,
    RatingTemplateAnswer,
    RatingTemplateQuestion,
)


@admin.register(Rating)
class RatingAdmin(AuditLogAdminMixin, admin.ModelAdmin):
    ordering = ["-created"]
    list_display = [
        "id",
        "author",
        "position",
        "level",
        "rating_type",
        "rating_class",
        "created",
        "last_updated",
        "score",
    ]
    list_filter = ["rating_type"]
    search_fields = [
        "level__name",
        "author__username",
        "author__first_name",
        "author__last_name",
    ]
    readonly_fields = ["created", "last_updated", "score", "rating_class"]
    raw_id_fields = ["level", "author"]

    def score(self, obj):
        return get_rating_score(obj)


@admin.register(RatingTemplateQuestion)
class RatingTemplateQuestionAdmin(admin.ModelAdmin):
    ordering = ["position"]
    list_display = ["position", "question_text", "weight"]


@admin.register(RatingTemplateAnswer)
class RatingTemplateAnswerAdmin(admin.ModelAdmin):
    list_filter = ["question"]
    ordering = ["position"]
    list_display = ["question", "position", "answer_text", "points"]
