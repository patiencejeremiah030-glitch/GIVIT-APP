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
    other_participant = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    item_title = serializers.CharField(source="item.title", read_only=True)

    class Meta:
        model = Conversation
        fields = (
            "id",
            "participants",
            "participant_usernames",
            "other_participant",
            "unread_count",
            "item",
            "item_title",
            "last_message",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields

    def get_participant_usernames(self, obj):
        return list(obj.participants.values_list("username", flat=True))

    def get_other_participant(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return None
        other = obj.participants.exclude(pk=request.user.pk).first()
        if not other:
            return None
        avatar = other.avatar.url if other.avatar else None
        if avatar and request:
            avatar = request.build_absolute_uri(avatar)
        return {
            "id": other.id,
            "username": other.username,
            "avatar": avatar,
        }

    def get_unread_count(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return 0
        return (
            obj.messages.filter(is_read=False)
            .exclude(sender=request.user)
            .count()
        )

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
