from rest_framework import viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from apps.users.permissions import IsOwner
from .models import Account
from .serializers import AccountSerializer
from .services import can_delete_account


class AccountViewSet(viewsets.ModelViewSet):
    """
    CRUD de cuentas/billeteras del usuario autenticado.

    SEGURIDAD: get_queryset() filtra por user=request.user.
    Esto significa que un UUID perteneciente a otro usuario retorna 404,
    no 403 — no se revela si el recurso existe.

    N+1: select_related('asset') hace un JOIN en la misma query,
    evitando queries adicionales al serializar asset_id y asset_name.
    """
    serializer_class = AccountSerializer
    permission_classes = [IsAuthenticated, IsOwner]

    def get_queryset(self):
        return (
            Account.objects
            .filter(user=self.request.user)
            .select_related('asset')
            .order_by('created_at')
        )

    def perform_create(self, serializer):
        # Inyecta el usuario autenticado. El cliente nunca envía user en el payload.
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        # Bloquea el cambio de asset después de la creación.
        # Cambiar el asset de una cuenta con balance existente corrompería los datos.
        serializer.save(asset=serializer.instance.asset)

    def perform_destroy(self, instance):
        if not can_delete_account(instance):
            raise ValidationError(
                'No se puede eliminar una cuenta con historial de transacciones.'
            )
        instance.delete()
