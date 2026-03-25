"""
Settings de producción.
Activo cuando DJANGO_SETTINGS_MODULE=core.settings.production
"""
from .base import *  # noqa: F401, F403

DEBUG = False

# En producción, definir los hosts permitidos explícitamente vía variable de entorno.
# Ejemplo en .env: ALLOWED_HOSTS=myapp.com,www.myapp.com
import environ
env = environ.Env()
ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=[])

# Seguridad adicional en producción
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
