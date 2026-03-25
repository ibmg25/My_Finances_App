from decimal import Decimal
from typing import Any

from django.db import transaction as db_transaction
from django.db.models import F

from apps.accounts.models import Account
from .models import Transaction


def create_transaction(user: Any, validated_data: dict) -> Transaction:
    """
    Crea una transacción y actualiza los balances de forma atómica.

    Lógica de balance por tipo:
      DEPOSIT:    destination.balance += (amount - fee_amount)
      WITHDRAWAL: origin.balance      -= (amount + fee_amount)
      TRANSFER:   origin.balance      -= (amount + fee_amount)
                  destination.balance += amount
                  (el fee se descuenta del origen; el destino recibe el monto completo)

    Seguridad contra concurrencia:
      select_for_update() adquiere un lock de fila en PostgreSQL (SELECT ... FOR UPDATE).
      Dos requests simultáneos de retiro de la misma cuenta esperarán en cola,
      en lugar de leer el mismo balance y producir un resultado incorrecto.

    Seguridad contra race conditions:
      F('balance') delega la aritmética a la base de datos:
        UPDATE accounts SET balance = balance - X WHERE id = ?
      Esto es atómico a nivel de motor SQL. Python nunca lee el valor
      intermedio del balance.
    """
    tx_type: str = validated_data['type']
    amount: Decimal = validated_data['amount']
    fee: Decimal = validated_data.get('fee_amount', Decimal('0'))
    origin: Account | None = validated_data.get('account_origin')
    destination: Account | None = validated_data.get('account_destination')

    with db_transaction.atomic():
        # Collect the PKs of the accounts involved in this transaction
        account_ids = [acc.pk for acc in [origin, destination] if acc is not None]

        # Re-fetch with FOR UPDATE lock inside the atomic block.
        # This prevents two concurrent requests from reading the same balance.
        locked: dict[Any, Account] = {
            acc.pk: acc
            for acc in Account.objects.select_for_update().filter(pk__in=account_ids)
        }

        # Replace the pre-fetched instances with the locked ones
        if origin:
            origin = locked[origin.pk]
        if destination:
            destination = locked[destination.pk]

        # Apply balance updates using F() expressions.
        # save(update_fields=['balance']) emits a targeted UPDATE — only the balance column.
        if tx_type == Transaction.TransactionType.DEPOSIT:
            destination.balance = F('balance') + (amount - fee)
            destination.save(update_fields=['balance'])

        elif tx_type == Transaction.TransactionType.WITHDRAWAL:
            origin.balance = F('balance') - (amount + fee)
            origin.save(update_fields=['balance'])

        elif tx_type == Transaction.TransactionType.TRANSFER:
            origin.balance = F('balance') - (amount + fee)
            origin.save(update_fields=['balance'])
            destination.balance = F('balance') + amount
            destination.save(update_fields=['balance'])

        # Create the immutable ledger record.
        # validated_data already contains Account instances resolved by the serializer.
        tx = Transaction.objects.create(user=user, **validated_data)

    return tx
