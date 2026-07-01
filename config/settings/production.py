from .base import *  # noqa: F403

DEBUG = False

# PythonAnywhere / reverse-proxy HTTPS (required with SECURE_SSL_REDIRECT)
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True

# Allow all Vercel deploy URLs (production + preview) without editing CORS per deploy
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://[\w-]+\.vercel\.app$",
]
