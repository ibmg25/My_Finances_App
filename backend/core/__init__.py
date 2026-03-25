# Importar celery_app aquí garantiza que Celery se inicialice
# cuando Django arranca, antes de que cualquier app intente usarlo.
from .celery import app as celery_app

__all__ = ('celery_app',)
