from decimal import Decimal
from django.db import models


class Asset(models.Model):
    """
    Catálogo de monedas fiat y criptoactivos soportados por la aplicación.

    La PK es un string corto en lugar de un UUID porque los identificadores
    de activos son estables y legibles (ej: 'USD', 'BTC', 'ETH').

    current_price_usd es el precio de mercado actualizado periódicamente
    por el worker de Celery (sync_crypto_prices). Para USD siempre es 1.
    """

    class AssetType(models.TextChoices):
        FIAT = 'FIAT', 'Fiat Currency'
        CRYPTO = 'CRYPTO', 'Cryptocurrency'

    # PK explícita: 'USD', 'BOB', 'BTC', 'ETH', etc.
    id = models.CharField(max_length=20, primary_key=True)
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=10, choices=AssetType.choices)
    # Precio en USD. Decimal(24,8) para soportar fracciones de cripto.
    # NUNCA usar float para valores financieros.
    current_price_usd = models.DecimalField(
        max_digits=24,
        decimal_places=8,
        default=Decimal('1'),
    )
    last_price_update = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'assets'

    def __str__(self) -> str:
        return f'{self.id} ({self.name})'
