from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.items.models import Item

from .models import ItemRequest
from .serializers import ItemRequestSerializer


class ItemRequestListCreateView(generics.ListCreateAPIView):
    serializer_class = ItemRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return (
            ItemRequest.objects.filter(
                Q(requester=user) | Q(item__owner=user)
            )
            .select_related("item", "item__owner", "item__category", "requester")
            .prefetch_related("item__images")
        )

    def perform_create(self, serializer):
        item = serializer.validated_data["item"]
        item_request = serializer.save(requester=self.request.user)
        if item.status == Item.Status.AVAILABLE:
            item.status = Item.Status.REQUESTED
            item.save(update_fields=["status", "updated_at"])
        return item_request


class ItemRequestDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = ItemRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return ItemRequest.objects.filter(
            Q(requester=user) | Q(item__owner=user)
        ).select_related("item", "requester")

    def perform_destroy(self, instance):
        from rest_framework.exceptions import PermissionDenied

        if instance.requester != self.request.user:
            raise PermissionDenied("Only the requester can cancel this request.")
        instance.status = ItemRequest.Status.CANCELLED
        instance.save(update_fields=["status", "updated_at"])
        if not instance.item.requests.filter(
            status=ItemRequest.Status.PENDING
        ).exists():
            instance.item.status = Item.Status.AVAILABLE
            instance.item.save(update_fields=["status", "updated_at"])

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)


class AcceptRequestView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        item_request = get_object_or_404(
            ItemRequest, pk=pk, item__owner=request.user
        )
        if item_request.status != ItemRequest.Status.PENDING:
            return Response(
                {"detail": "Only pending requests can be accepted."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        item_request.status = ItemRequest.Status.ACCEPTED
        item_request.save(update_fields=["status", "updated_at"])
        item_request.item.status = Item.Status.GIVEN
        item_request.item.save(update_fields=["status", "updated_at"])
        item_request.item.requests.filter(status=ItemRequest.Status.PENDING).exclude(
            pk=item_request.pk
        ).update(status=ItemRequest.Status.REJECTED)
        return Response(ItemRequestSerializer(item_request).data)


class RejectRequestView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        item_request = get_object_or_404(
            ItemRequest, pk=pk, item__owner=request.user
        )
        if item_request.status != ItemRequest.Status.PENDING:
            return Response(
                {"detail": "Only pending requests can be rejected."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        item_request.status = ItemRequest.Status.REJECTED
        item_request.save(update_fields=["status", "updated_at"])
        if not item_request.item.requests.filter(
            status=ItemRequest.Status.PENDING
        ).exists():
            item_request.item.status = Item.Status.AVAILABLE
            item_request.item.save(update_fields=["status", "updated_at"])
        return Response(ItemRequestSerializer(item_request).data)
