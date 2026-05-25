from django.contrib import admin
from django.urls import reverse
from django.utils.html import format_html

from trcustoms.audit_logs.mixins import AuditLogAdminMixin
from trcustoms.reviews.models import Review, ReviewVote


class ReviewVoteInline(admin.TabularInline):
    model = ReviewVote
    extra = 0
    raw_id_fields = ["user"]
    readonly_fields = ["created", "last_updated"]


@admin.register(Review)
class ReviewAdmin(AuditLogAdminMixin, admin.ModelAdmin):
    ordering = ["-created"]
    list_display = [
        "id",
        "author",
        "position",
        "level",
        "created",
        "last_updated",
    ]
    search_fields = [
        "level__name",
        "author__username",
        "author__first_name",
        "author__last_name",
    ]
    readonly_fields = ["created", "last_updated"]
    raw_id_fields = ["level", "author"]
    inlines = [ReviewVoteInline]


@admin.register(ReviewVote)
class ReviewVoteAdmin(admin.ModelAdmin):
    ordering = ["-created"]
    list_display = [
        "id",
        "user",
        "review_link",
        "vote",
        "created",
        "last_updated",
    ]
    list_filter = ["vote"]
    search_fields = [
        "user__username",
        "user__first_name",
        "user__last_name",
        "review__author__username",
        "review__level__name",
    ]
    readonly_fields = ["created", "last_updated"]
    raw_id_fields = ["user", "review"]

    @admin.display(description="review", ordering="review")
    def review_link(self, obj: ReviewVote) -> str:
        url = reverse(
            "admin:reviews_review_change",
            args=[obj.review_id],
        )
        return format_html('<a href="{}">{}</a>', url, obj.review)
