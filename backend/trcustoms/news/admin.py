from django.contrib import admin

from trcustoms.news.models import News


@admin.register(News)
class NewsAdmin(admin.ModelAdmin):
    list_display = ["created", "subject"]
