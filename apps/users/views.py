from django.contrib.auth import authenticate, get_user_model
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from apps.item_requests.models import ItemRequest
from apps.items.models import Item
from apps.messaging.models import Conversation, Message

from .serializers import PublicUserSerializer, RegisterSerializer, UserProfileSerializer

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "user": UserProfileSerializer(user).data,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email", "").strip().lower()
        password = request.data.get("password", "")
        user = authenticate(request, username=email, password=password)
        if user is None:
            user = User.objects.filter(email__iexact=email).first()
            if user is None or not user.check_password(password):
                return Response(
                    {"detail": "Invalid email or password."},
                    status=status.HTTP_401_UNAUTHORIZED,
                )
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": UserProfileSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response(
                {"detail": "Refresh token is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception:
            return Response(
                {"detail": "Invalid refresh token."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(status=status.HTTP_205_RESET_CONTENT)


class MeView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserProfileSerializer

    def get_object(self):
        return self.request.user


class DashboardView(APIView):
    """Summary stats for the logged-in user's home screen."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        my_items = Item.objects.filter(owner=user)
        incoming_requests = ItemRequest.objects.filter(item__owner=user)
        my_requests = ItemRequest.objects.filter(requester=user)
        my_conversations = Conversation.objects.filter(participants=user)

        unread_messages = Message.objects.filter(
            conversation__in=my_conversations,
            is_read=False,
        ).exclude(sender=user)

        return Response(
            {
                "user": UserProfileSerializer(user).data,
                "items": {
                    "total": my_items.count(),
                    "available": my_items.filter(status=Item.Status.AVAILABLE).count(),
                    "requested": my_items.filter(status=Item.Status.REQUESTED).count(),
                    "given": my_items.filter(status=Item.Status.GIVEN).count(),
                },
                "requests": {
                    "incoming_pending": incoming_requests.filter(
                        status=ItemRequest.Status.PENDING
                    ).count(),
                    "my_pending": my_requests.filter(
                        status=ItemRequest.Status.PENDING
                    ).count(),
                    "my_accepted": my_requests.filter(
                        status=ItemRequest.Status.ACCEPTED
                    ).count(),
                },
                "messages": {
                    "conversations": my_conversations.count(),
                    "unread": unread_messages.count(),
                },
            }
        )


class UserDetailView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = PublicUserSerializer
    queryset = User.objects.all()
    lookup_field = "pk"
