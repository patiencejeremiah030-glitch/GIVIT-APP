from django.contrib import admin

from .models import Category, Item, ItemImage


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


class ItemImageInline(admin.TabularInline):
    model = ItemImage
    extra = 1


@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = ("title", "owner", "category", "listing_type", "status", "created_at")
    list_filter = ("status", "listing_type", "category")
    search_fields = ("title", "description", "location")
    inlines = [ItemImageInline]
