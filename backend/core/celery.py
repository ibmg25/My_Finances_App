"""
Configuración de Celery para el proyecto Django.

Celery es el sistema de tareas en segundo plano. Este archivo:
1. Le dice a Celery qué settings de Django usar.
2. Configura Celery para leer sus settings desde django.conf.settings
   (cualquier variable que empiece con CELERY_ en settings).
3. Autodiscover: busca automáticamente archivos tasks.py en todos
   los apps registrados en INSTALLED_APPS.
"""
import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.development')

app = Celery('core')

# Carga la configuración desde django.conf.settings.
# namespace='CELERY' significa que solo lee variables con prefijo CELERY_
app.config_from_object('django.conf:settings', namespace='CELERY')

# Descubre automáticamente tasks.py en cada app de INSTALLED_APPS
app.autodiscover_tasks()
