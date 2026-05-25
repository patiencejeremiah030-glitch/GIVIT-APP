from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path
from django.views.generic import RedirectView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework_simplejwt.views import TokenRefreshView


def health_check(request):
    return JsonResponse({"status": "ok", "service": "GIVIT API"})


def api_root(request):
    return JsonResponse(
        {
            "name": "GIVIT API",
            "version": "1.0",
            "health": request.build_absolute_uri("/api/health/"),
            "docs": request.build_absolute_uri("/api/docs/"),
            "admin": request.build_absolute_uri("/admin/"),
            "api_v1": request.build_absolute_uri("/api/v1/"),
        }
    )


def api_v1_root(request):
    base = request.build_absolute_uri("/api/v1/")
    return JsonResponse(
        {
            "version": "v1",
            "message": "GIVIT API v1 — use the endpoints below.",
            "documentation": request.build_absolute_uri("/api/docs/"),
            "endpoints": {
                "users": {
                    "register": f"{base}users/register/",
                    "login": f"{base}users/login/",
                    "logout": f"{base}users/logout/",
                    "profile": f"{base}users/me/",
                    "dashboard": f"{base}users/dashboard/",
                },
                "items": {
                    "list_create": f"{base}items/",
                    "categories": f"{base}items/categories/",
                    "my_items": f"{base}items/my/",
                },
                "requests": f"{base}requests/",
                "messages": f"{base}messages/conversations/",
                "reports": f"{base}reports/",
                "token_refresh": request.build_absolute_uri("/api/v1/auth/token/refresh/"),
            },
        }
    )


urlpatterns = [
    path("", api_root, name="api-root"),
    path("docs/", RedirectView.as_view(url="/api/docs/", permanent=False), name="docs-redirect"),
    path("admin/", admin.site.urls),
    path("api/health/", health_check, name="health-check"),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path("api/v1/", api_v1_root, name="api-v1-root"),
    path("api/v1/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/v1/users/", include("apps.users.urls")),
    path("api/v1/items/", include("apps.items.urls")),
    path("api/v1/messages/", include("apps.messaging.urls")),
    path("api/v1/requests/", include("apps.item_requests.urls")),
    path("api/v1/reports/", include("apps.reports.urls")),
]

if not settings.CLOUDINARY_CONFIGURED:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
