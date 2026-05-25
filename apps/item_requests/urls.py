from django.urls import path

from .views import (
    AcceptRequestView,
    ItemRequestDetailView,
    ItemRequestListCreateView,
    RejectRequestView,
)

urlpatterns = [
    path("", ItemRequestListCreateView.as_view(), name="request-list-create"),
    path("<int:pk>/", ItemRequestDetailView.as_view(), name="request-detail"),
    path("<int:pk>/accept/", AcceptRequestView.as_view(), name="request-accept"),
    path("<int:pk>/reject/", RejectRequestView.as_view(), name="request-reject"),
]
