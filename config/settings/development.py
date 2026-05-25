from .base import *  # noqa: F403

DEBUG = True
ALLOWED_HOSTS = list(ALLOWED_HOSTS) + ["testserver"]  # noqa: F405
