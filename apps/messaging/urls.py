from django.urls import path

from .views import (
    ConversationListView,
    MarkMessagesReadView,
    MessageListCreateView,
    StartConversationView,
)

urlpatterns = [
    path("conversations/", ConversationListView.as_view(), name="conversation-list"),
    path(
        "conversations/start/",
        StartConversationView.as_view(),
        name="conversation-start",
    ),
    path(
        "conversations/<int:pk>/messages/",
        MessageListCreateView.as_view(),
        name="message-list-create",
    ),
    path(
        "conversations/<int:pk>/read/",
        MarkMessagesReadView.as_view(),
        name="messages-mark-read",
    ),
]
