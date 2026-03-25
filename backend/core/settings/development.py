"""
Settings de desarrollo local.
Activo cuando DJANGO_SETTINGS_MODULE=core.settings.development
"""
from .base import *  # noqa: F401, F403

DEBUG = True

ALLOWED_HOSTS = ['*']

# The Next.js rewrite proxy strips trailing slashes from :path* captures.
# Disabling APPEND_SLASH prevents Django from throwing RuntimeError on POST
# requests that arrive without a trailing slash.
APPEND_SLASH = False
