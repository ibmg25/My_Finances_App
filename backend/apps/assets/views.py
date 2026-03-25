from rest_framework.viewsets import ReadOnlyModelViewSet
from .models import Asset
from .serializers import AssetSerializer


class AssetViewSet(ReadOnlyModelViewSet):
    """
    Endpoints de solo lectura para el catálogo de activos.
    Proporciona list() y retrieve() automáticamente.
    El catálogo es global — no requiere filtro por usuario.
    """
    serializer_class = AssetSerializer
    queryset = Asset.objects.all().order_by('type', 'id')
