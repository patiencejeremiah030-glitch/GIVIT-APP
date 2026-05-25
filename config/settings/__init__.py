from decouple import config

_settings = config("DJANGO_SETTINGS_MODULE", default="config.settings.development")
if _settings.endswith("production"):
    from .production import *  # noqa: F403
else:
    from .development import *  # noqa: F403
