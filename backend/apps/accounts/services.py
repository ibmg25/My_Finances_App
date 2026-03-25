from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .models import Account


def can_delete_account(account: 'Account') -> bool:
    """
    Devuelve True si la cuenta puede eliminarse de forma segura.
    Devuelve False si tiene historial de transacciones.

    Una cuenta con transacciones no puede borrarse porque el ledger
    financiero es inmutable — eliminarla rompería la integridad del historial.
    """
    has_origin = account.transactions_as_origin.exists()
    has_destination = account.transactions_as_destination.exists()
    return not (has_origin or has_destination)
