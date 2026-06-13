from django.db.models import BooleanField, Exists, OuterRef, Value
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter, SearchFilter

from core.permissions import IsAdminRole, IsOwnerOrReadOnly
from .filters import ItemFilter
from .models import Category, Favorite, Item, ItemImage
from .serializers import (
    CategorySerializer,
    ItemCreateUpdateSerializer,
    ItemDetailSerializer,
    ItemImageSerializer,
    ItemListSerializer,
)


def annotate_favorited(queryset, user):
    if not user.is_authenticated:
        return queryset.annotate(
            is_favorited=Value(False, output_field=BooleanField())
        )
    favorite_exists = Favorite.objects.filter(user=user, item=OuterRef("pk"))
    return queryset.annotate(is_favorited=Exists(favorite_exists))


class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None


class ItemListCreateView(generics.ListCreateAPIView):
    filterset_class = ItemFilter
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ["title", "description"]
    ordering_fields = ["created_at", "price"]
    ordering = ["-created_at"]

    def get_queryset(self):
        qs = Item.objects.select_related("category", "owner").prefetch_related("images")
        if self.request.method == "GET":
            qs = qs.filter(status=Item.Status.AVAILABLE)
        return annotate_favorited(qs, self.request.user)

    def get_serializer_class(self):
        if self.request.method == "POST":
            return ItemCreateUpdateSerializer
        return ItemListSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class ItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsOwnerOrReadOnly]

    def get_queryset(self):
        return annotate_favorited(
            Item.objects.select_related("category", "owner").prefetch_related("images"),
            self.request.user,
        )

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return ItemCreateUpdateSerializer
        return ItemDetailSerializer

    def get_permissions(self):
        if self.request.method == "GET":
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), IsOwnerOrReadOnly()]


class MyItemsView(generics.ListAPIView):
    serializer_class = ItemListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return annotate_favorited(
            Item.objects.filter(owner=self.request.user)
            .select_related("category", "owner")
            .prefetch_related("images"),
            self.request.user,
        )


class FavoriteListView(generics.ListAPIView):
    serializer_class = ItemListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return annotate_favorited(
            Item.objects.filter(favorited_by__user=self.request.user)
            .select_related("category", "owner")
            .prefetch_related("images")
            .distinct(),
            self.request.user,
        )


class ItemFavoriteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        item = get_object_or_404(Item, pk=pk)
        _, created = Favorite.objects.get_or_create(user=request.user, item=item)
        if not created:
            return Response({"detail": "Already saved."}, status=status.HTTP_200_OK)
        return Response({"detail": "Item saved."}, status=status.HTTP_201_CREATED)

    def delete(self, request, pk):
        item = get_object_or_404(Item, pk=pk)
        deleted, _ = Favorite.objects.filter(user=request.user, item=item).delete()
        if not deleted:
            return Response({"detail": "Item was not saved."}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)


class ItemImageUploadView(generics.CreateAPIView):
    serializer_class = ItemImageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        item = get_object_or_404(Item, pk=self.kwargs["pk"], owner=self.request.user)
        is_primary = serializer.validated_data.get("is_primary", False)
        if is_primary:
            item.images.update(is_primary=False)
        serializer.save(item=item)


class AdminModerateItemView(APIView):
    permission_classes = [IsAdminRole]

    def delete(self, request, pk):
        item = get_object_or_404(Item, pk=pk)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
