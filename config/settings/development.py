from .base import *  # noqa: F403

DEBUG = True
ALLOWED_HOSTS = list(ALLOWED_HOSTS) + ["testserver"]  # noqa: F405

# Local dev: allow any origin when hitting Django directly (e.g. Swagger on :8001)
CORS_ALLOW_ALL_ORIGINS = True
