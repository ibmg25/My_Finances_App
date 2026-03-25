import uuid
from decimal import Decimal
from django.conf import settings
from django.db import models


class Category(models.Model):
    """
    Categoría para clasificar transacciones (ej: Salario, Alquiler, Comida).

    user=None indica una categoría del sistema (disponible para todos los usuarios).
    user!=None indica una categoría personalizada creada por ese usuario.
    """

    class CategoryType(models.TextChoices):
        INCOME = 'INCOME', 'Income'
        EXPENSE = 'EXPENSE', 'Expense'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,   # null = categoría del sistema
        blank=True,
        related_name='categories',
    )
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=10, choices=CategoryType.choices)

    class Meta:
        db_table = 'categories'

    def __str__(self) -> str:
        return self.name


class Transaction(models.Model):
    """
    Registro inmutable de una operación financiera. Es el corazón del sistema.

    Tipos:
    - DEPOSIT:    ingreso externo (ej: salario depositado en una cuenta).
                  account_origin=None, account_destination=la cuenta destino.
    - WITHDRAWAL: egreso externo (ej: pago de un servicio).
                  account_origin=la cuenta origen, account_destination=None.
    - TRANSFER:   movimiento entre dos cuentas propias (ej: de banco a exchange).
                  Ambas cuentas requeridas.

    exchange_rate: tipo de cambio en el momento exacto de la operación.
    Vital para cálculos futuros de P&L (ganancia/pérdida) en cripto.
    """

    class TransactionType(models.TextChoices):
        DEPOSIT = 'DEPOSIT', 'Deposit'
        WITHDRAWAL = 'WITHDRAWAL', 'Withdrawal'
        TRANSFER = 'TRANSFER', 'Transfer'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='transactions',
    )
    type = models.CharField(max_length=20, choices=TransactionType.choices)
    amount = models.DecimalField(max_digits=24, decimal_places=8)
    fee_amount = models.DecimalField(
        max_digits=24,
        decimal_places=8,
        default=Decimal('0'),
    )

    # Dos FKs a la misma tabla (accounts) requieren related_name distintos
    # para evitar el error "reverse accessor clashes".
    # on_delete=PROTECT: no se puede borrar una cuenta que tenga historial de transacciones.
    account_origin = models.ForeignKey(
        'accounts.Account',
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='transactions_as_origin',
        db_column='account_origin_id',
    )
    account_destination = models.ForeignKey(
        'accounts.Account',
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='transactions_as_destination',
        db_column='account_destination_id',
    )

    # on_delete=SET_NULL: borrar una categoría no borra las transacciones que la usan.
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='transactions',
    )

    # Tipo de cambio en el momento de la transacción.
    # Nullable porque no aplica en transacciones dentro de la misma moneda.
    exchange_rate = models.DecimalField(
        max_digits=24,
        decimal_places=8,
        null=True,
        blank=True,
    )
    timestamp = models.DateTimeField()
    description = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'transactions'
        indexes = [
            # Índice compuesto para el query más frecuente del dashboard:
            # "dame las últimas N transacciones de este usuario".
            # Previene el problema N+1 al listar el historial (REQ-5.3).
            models.Index(
                fields=['user', '-timestamp'],
                name='idx_tx_user_timestamp',
            ),
        ]

    def __str__(self) -> str:
        return f'{self.type} {self.amount} @ {self.timestamp}'
