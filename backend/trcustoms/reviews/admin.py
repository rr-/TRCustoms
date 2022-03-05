from django.contrib import admin

from trcustoms.audit_logs.mixins import AuditLogAdminMixin
from trcustoms.ratings import get_review_score
from trcustoms.reviews.models import (
    LevelReview,
    ReviewTemplateAnswer,
    ReviewTemplateQuestion,
)


@admin.register(LevelReview)
class LevelReviewAdmin(AuditLogAdminMixin, admin.ModelAdmin):
    ordering = ["-created"]
    list_display = [
        "id",
        "author",
        "level",
        "review_type",
        "rating_class",
        "created",
        "last_updated",
    ]
    list_filter = ["review_type"]
    search_fields = [
        "level__name",
        "author__username",
        "author__first_name",
        "author__last_name",
    ]
    readonly_fields = ["created", "last_updated", "score", "rating_class"]
    raw_id_fields = ["level", "author"]

    def score(self, obj):
        return get_review_score(obj)


@admin.register(ReviewTemplateQuestion)
class ReviewTemplateQuestionAdmin(admin.ModelAdmin):
    ordering = ["position"]
    list_display = ["position", "question_text", "weight"]


@admin.register(ReviewTemplateAnswer)
class ReviewTemplateAnswerAdmin(admin.ModelAdmin):
    list_filter = ["question"]
    ordering = ["position"]
    list_display = ["question", "position", "answer_text", "points"]
