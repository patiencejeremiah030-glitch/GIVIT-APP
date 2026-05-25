from django.urls import path

from .views import ReportAdminListView, ReportAdminUpdateView, ReportCreateView

urlpatterns = [
    path("", ReportCreateView.as_view(), name="report-create"),
    path("admin/", ReportAdminListView.as_view(), name="report-admin-list"),
    path("admin/<int:pk>/", ReportAdminUpdateView.as_view(), name="report-admin-detail"),
]
