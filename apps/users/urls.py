from django.urls import path

from .views import (
    DashboardView,
    LoginView,
    LogoutView,
    MeView,
    RegisterView,
    UserDetailView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("me/", MeView.as_view(), name="me"),
    path("dashboard/", DashboardView.as_view(), name="dashboard"),
    path("<int:pk>/", UserDetailView.as_view(), name="user-detail"),
]
