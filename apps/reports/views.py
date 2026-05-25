from rest_framework import generics, permissions

from core.permissions import IsAdminRole

from .models import Report
from .serializers import ReportCreateSerializer, ReportSerializer


class ReportCreateView(generics.CreateAPIView):
    serializer_class = ReportCreateSerializer
    permission_classes = [permissions.IsAuthenticated]


class ReportAdminListView(generics.ListAPIView):
    serializer_class = ReportSerializer
    permission_classes = [IsAdminRole]
    filterset_fields = ("status", "report_type")

    def get_queryset(self):
        return Report.objects.select_related("reporter", "content_type")


class ReportAdminUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = ReportSerializer
    permission_classes = [IsAdminRole]
    queryset = Report.objects.select_related("reporter", "content_type")
