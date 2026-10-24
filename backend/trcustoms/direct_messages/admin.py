from django.contrib import admin

from trcustoms.direct_messages.models import Message, Thread


class MessageInline(admin.TabularInline):
    model = Message
    extra = 0
    raw_id_fields = ["origin_sender", "sender", "receiver"]
    readonly_fields = ["created"]


@admin.register(Thread)
class ThreadAdmin(admin.ModelAdmin):
    list_display = ["id", "starter", "recipient", "last_message_at"]
    search_fields = ["starter__username", "recipient__username"]
    raw_id_fields = ["starter", "recipient"]
    readonly_fields = ["created", "last_updated"]
    inlines = [MessageInline]
