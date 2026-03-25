"""
Tareas Celery del dominio assets.

Celery autodiscover encuentra este archivo automáticamente.
Aquí vivirá la tarea sync_crypto_prices que consulta CoinGecko
cada 15 minutos (REQ-4.1 / REQ-4.2).
"""
from celery import shared_task


@shared_task
def sync_crypto_prices() -> None:
    """
    Tarea pendiente de implementar en Fase 2.
    Consultará la API de CoinGecko y actualizará Asset.current_price_usd
    para todos los activos de tipo CRYPTO.
    """
    pass
