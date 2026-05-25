from rest_framework import serializers

from .models import Category, Item, ItemImage


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "name", "slug")


class ItemImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemImage
        fields = ("id", "image", "is_primary", "created_at")
        read_only_fields = ("id", "created_at")


class ItemListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    category_slug = serializers.CharField(source="category.slug", read_only=True)
    owner_name = serializers.CharField(source="owner.username", read_only=True)
    owner_id = serializers.IntegerField(source="owner.id", read_only=True)
    primary_image = serializers.SerializerMethodField()

    class Meta:
        model = Item
        fields = (
            "id",
            "title",
            "category",
            "category_name",
            "category_slug",
            "condition",
            "location",
            "listing_type",
            "price",
            "status",
            "owner_id",
            "owner_name",
            "primary_image",
            "created_at",
        )

    def get_primary_image(self, obj):
        img = obj.images.filter(is_primary=True).first() or obj.images.first()
        if img and img.image:
            request = self.context.get("request")
            url = img.image.url
            if request and url.startswith("/"):
                return request.build_absolute_uri(url)
            return url
        return None


class ItemDetailSerializer(serializers.ModelSerializer):
    images = ItemImageSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)
    owner_username = serializers.CharField(source="owner.username", read_only=True)
    owner_id = serializers.IntegerField(source="owner.id", read_only=True)

    class Meta:
        model = Item
        fields = (
            "id",
            "owner_id",
            "owner_username",
            "title",
            "description",
            "category",
            "category_name",
            "condition",
            "location",
            "listing_type",
            "price",
            "status",
            "images",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("owner_id", "owner_username", "status", "created_at", "updated_at")

    def validate(self, attrs):
        listing_type = attrs.get(
            "listing_type",
            getattr(self.instance, "listing_type", None),
        )
        price = attrs.get("price", getattr(self.instance, "price", None))
        if listing_type == Item.ListingType.SALE and price is None:
            raise serializers.ValidationError(
                {"price": "Sale listings require a price."}
            )
        if listing_type == Item.ListingType.FREE:
            attrs["price"] = None
        return attrs


class ItemCreateUpdateSerializer(ItemDetailSerializer):
    class Meta(ItemDetailSerializer.Meta):
        read_only_fields = (
            "owner_id",
            "owner_username",
            "status",
            "images",
            "created_at",
            "updated_at",
        )
