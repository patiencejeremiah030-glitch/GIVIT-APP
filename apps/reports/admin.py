from django.contrib import admin

from .models import Report


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ("report_type", "reporter", "status", "object_id", "created_at")
    list_filter = ("status", "report_type")
    search_fields = ("reason", "reporter__email")
