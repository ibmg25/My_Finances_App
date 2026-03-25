from rest_framework import serializers
from .models import Asset


class AssetSerializer(serializers.ModelSerializer):
    """
    Serializer de solo lectura para el catálogo de activos.
    Las escrituras ocurren únicamente a través del worker de Celery,
    nunca a través de la API pública.
    """

    class Meta:
        model = Asset
        fields = ['id', 'name', 'type', 'current_price_usd', 'last_price_update']
        read_only_fields = ['id', 'name', 'type', 'current_price_usd', 'last_price_update']
