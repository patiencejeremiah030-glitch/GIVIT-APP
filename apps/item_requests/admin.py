from django.contrib import admin

from .models import ItemRequest


@admin.register(ItemRequest)
class ItemRequestAdmin(admin.ModelAdmin):
    list_display = ("item", "requester", "status", "created_at")
    list_filter = ("status",)
    search_fields = ("item__title", "requester__email")
