from django.contrib.auth import get_user_model
from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.items.models import Item

from .models import Conversation, Message
from .serializers import (
    ConversationSerializer,
    MessageSerializer,
    StartConversationSerializer,
)

User = get_user_model()


class ConversationListView(generics.ListAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Conversation.objects.filter(participants=self.request.user)
            .prefetch_related("participants", "messages")
            .select_related("item")
            .distinct()
        )


class StartConversationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = StartConversationSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        recipient = get_object_or_404(User, pk=serializer.validated_data["recipient_id"])
        item_id = serializer.validated_data.get("item_id")
        item = Item.objects.filter(pk=item_id).first() if item_id else None
        body = serializer.validated_data.get("body", "")

        conversation = self._find_existing_conversation(request.user, recipient, item)
        if not conversation:
            conversation = Conversation.objects.create(item=item)
            conversation.participants.add(request.user, recipient)

        if body:
            Message.objects.create(
                conversation=conversation,
                sender=request.user,
                body=body,
            )
            conversation.save(update_fields=["updated_at"])

        return Response(
            ConversationSerializer(conversation).data,
            status=status.HTTP_201_CREATED if body else status.HTTP_200_OK,
        )

    def _find_existing_conversation(self, user, recipient, item):
        qs = Conversation.objects.filter(participants=user).filter(
            participants=recipient
        )
        if item:
            qs = qs.filter(item=item)
        else:
            qs = qs.filter(item__isnull=True)
        return qs.first()


class MessageListCreateView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_conversation(self):
        conversation = get_object_or_404(Conversation, pk=self.kwargs["pk"])
        if not conversation.participants.filter(pk=self.request.user.pk).exists():
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied("You are not part of this conversation.")
        return conversation

    def get_queryset(self):
        conversation = self.get_conversation()
        return Message.objects.filter(conversation=conversation).select_related(
            "sender"
        )

    def perform_create(self, serializer):
        conversation = self.get_conversation()
        serializer.save(sender=self.request.user, conversation=conversation)
        conversation.save(update_fields=["updated_at"])


class MarkMessagesReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        conversation = get_object_or_404(Conversation, pk=pk)
        if not conversation.participants.filter(pk=request.user.pk).exists():
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied("You are not part of this conversation.")
        conversation.messages.filter(is_read=False).exclude(sender=request.user).update(
            is_read=True
        )
        return Response({"detail": "Messages marked as read."})
