from django.contrib import admin
from django.shortcuts import redirect
from django.urls import reverse

from trcustoms.news.models import GlobalMessage, News


@admin.register(News)
class NewsAdmin(admin.ModelAdmin):
    list_display = ["created", "subject"]


@admin.register(GlobalMessage)
class GlobalMessageAdmin(admin.ModelAdmin):
    list_display = ["message"]

    def has_add_permission(self, request):
        return not GlobalMessage.objects.exists()

    def changelist_view(self, request, extra_context=None):
        obj = GlobalMessage.objects.first()
        if obj:
            return redirect(
                reverse("admin:news_globalmessage_change", args=(obj.pk,))
            )
        return super().changelist_view(request, extra_context)
