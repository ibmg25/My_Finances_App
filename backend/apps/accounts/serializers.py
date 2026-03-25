from rest_framework import serializers
from .models import Account


class AccountSerializer(serializers.ModelSerializer):
    """
    Serializer para cuentas/billeteras del usuario.

    asset_id y asset_name son campos de solo lectura que se resuelven
    eficientemente vía select_related('asset') en el queryset del ViewSet.
    Esto evita N+1: si hay 20 cuentas, sigue siendo 1 query con JOIN.

    balance es read_only: es un caché gestionado exclusivamente por el
    service layer de transactions. El cliente nunca lo envía directamente.

    asset es writable en la creación (acepta 'USD', 'BTC', etc.)
    pero el ViewSet bloquea su modificación posterior (ver perform_update).
    """
    asset_id = serializers.CharField(source='asset.id', read_only=True)
    asset_name = serializers.CharField(source='asset.name', read_only=True)

    class Meta:
        model = Account
        fields = [
            'id', 'name',
            'asset',       # writable en create (PK del Asset)
            'asset_id',    # read_only — el ID como string legible
            'asset_name',  # read_only — nombre del asset
            'balance',
            'created_at',
        ]
        read_only_fields = ['id', 'balance', 'created_at', 'asset_id', 'asset_name']
