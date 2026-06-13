from django.urls import path

from .views import (
    AdminModerateItemView,
    CategoryListView,
    FavoriteListView,
    ItemDetailView,
    ItemFavoriteView,
    ItemImageUploadView,
    ItemListCreateView,
    MyItemsView,
)

urlpatterns = [
    path("categories/", CategoryListView.as_view(), name="category-list"),
    path("my/", MyItemsView.as_view(), name="my-items"),
    path("favorites/", FavoriteListView.as_view(), name="item-favorites"),
    path("", ItemListCreateView.as_view(), name="item-list-create"),
    path("<int:pk>/favorite/", ItemFavoriteView.as_view(), name="item-favorite"),
    path("<int:pk>/", ItemDetailView.as_view(), name="item-detail"),
    path("<int:pk>/images/", ItemImageUploadView.as_view(), name="item-image-upload"),
    path(
        "<int:pk>/moderate/",
        AdminModerateItemView.as_view(),
        name="item-moderate",
    ),
]
