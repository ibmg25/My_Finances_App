import uuid
from decimal import Decimal
from django.conf import settings
from django.db import models


class Account(models.Model):
    """
    Cuenta bancaria o billetera de criptomonedas de un usuario.

    Cada cuenta opera en una sola moneda/cripto (asset).
    Ejemplos: 'Cuenta Ahorro BCP' (asset: BOB), 'Binance Spot' (asset: USDT).

    NOTA SOBRE balance:
    Este campo es un CACHÉ para consultas rápidas. La fuente real de la verdad
    siempre es la suma de las transacciones asociadas a esta cuenta.
    Nunca actualizar balance directamente desde las views; usar la capa de
    servicios (accounts/services.py) que recalcula desde el ledger.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # settings.AUTH_USER_MODEL es el patrón Django para referenciar el User model
    # sin importarlo directamente, evitando problemas de orden de carga de apps.
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,  # si se borra el usuario, se borran sus cuentas
        related_name='accounts',
    )
    asset = models.ForeignKey(
        'assets.Asset',
        on_delete=models.PROTECT,  # no se puede borrar un asset con cuentas activas
        related_name='accounts',
    )
    name = models.CharField(max_length=255)
    balance = models.DecimalField(
        max_digits=24,
        decimal_places=8,
        default=Decimal('0'),
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'accounts'

    def __str__(self) -> str:
        return f'{self.name} ({self.asset_id})'
