from django.contrib.auth import get_user_model
from rest_framework import serializers

from apps.items.models import Item

from .models import Conversation, Message

User = get_user_model()


class MessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source="sender.username", read_only=True)

    class Meta:
        model = Message
        fields = (
            "id",
            "conversation",
            "sender",
            "sender_username",
            "body",
            "is_read",
            "created_at",
        )
        read_only_fields = ("id", "sender", "sender_username", "is_read", "created_at")


class ConversationSerializer(serializers.ModelSerializer):
    participants = serializers.PrimaryKeyRelatedField(
        many=True, read_only=True
    )
    participant_usernames = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    item_title = serializers.CharField(source="item.title", read_only=True)

    class Meta:
        model = Conversation
        fields = (
            "id",
            "participants",
            "participant_usernames",
            "item",
            "item_title",
            "last_message",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields

    def get_participant_usernames(self, obj):
        return list(obj.participants.values_list("username", flat=True))

    def get_last_message(self, obj):
        msg = obj.messages.order_by("-created_at").first()
        if msg:
            return MessageSerializer(msg).data
        return None


class StartConversationSerializer(serializers.Serializer):
    recipient_id = serializers.IntegerField()
    item_id = serializers.IntegerField(required=False, allow_null=True)
    body = serializers.CharField(required=False, allow_blank=True)

    def validate_recipient_id(self, value):
        user = self.context["request"].user
        if value == user.id:
            raise serializers.ValidationError("You cannot message yourself.")
        if not User.objects.filter(pk=value).exists():
            raise serializers.ValidationError("Recipient not found.")
        return value

    def validate_item_id(self, value):
        if value is not None and not Item.objects.filter(pk=value).exists():
            raise serializers.ValidationError("Item not found.")
        return value
