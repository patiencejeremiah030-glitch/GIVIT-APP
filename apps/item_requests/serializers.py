from rest_framework import serializers

from apps.items.models import Item
from apps.items.serializers import ItemListSerializer

from .models import ItemRequest


class ItemRequestSerializer(serializers.ModelSerializer):
    item_detail = ItemListSerializer(source="item", read_only=True)
    requester_username = serializers.CharField(
        source="requester.username", read_only=True
    )
    owner_id = serializers.IntegerField(source="item.owner_id", read_only=True)

    class Meta:
        model = ItemRequest
        fields = (
            "id",
            "item",
            "item_detail",
            "requester",
            "requester_username",
            "owner_id",
            "message",
            "status",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "requester",
            "requester_username",
            "owner_id",
            "status",
            "created_at",
            "updated_at",
        )

    def validate_item(self, item):
        user = self.context["request"].user
        if item.owner == user:
            raise serializers.ValidationError("You cannot request your own item.")
        if item.status != Item.Status.AVAILABLE:
            raise serializers.ValidationError("This item is not available.")
        return item
