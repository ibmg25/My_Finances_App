from django.db.models import Q
from rest_framework import viewsets, mixins, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Category, Transaction
from .serializers import (
    CategorySerializer,
    TransactionSerializer,
    TransactionCreateSerializer,
)
from .services import create_transaction


class CategoryViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    """
    Categorías para clasificar transacciones.

    List: devuelve categorías del sistema (user=None) + categorías propias del usuario.
    Create: crea una categoría personalizada para el usuario autenticado.
    Delete: solo permite borrar categorías propias, no las del sistema.
    """
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Una sola query con OR: categorías del sistema + las del usuario.
        # Sin esto habría que hacer 2 queries y mergear en Python (N+1).
        return (
            Category.objects
            .filter(Q(user=None) | Q(user=self.request.user))
            .order_by('type', 'name')
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_destroy(self, instance):
        if instance.user is None:
            raise PermissionDenied('No se pueden eliminar categorías del sistema.')
        if instance.user != self.request.user:
            raise PermissionDenied('No puedes eliminar categorías de otro usuario.')
        instance.delete()


class TransactionViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    """
    Registro de transacciones financieras.

    Las transacciones son INMUTABLES una vez creadas (no hay update ni delete).
    Esto preserva la integridad del ledger financiero.

    List/Retrieve: usa TransactionSerializer (con nombres denormalizados para la UI).
    Create: usa TransactionCreateSerializer (con validación estricta de negocio).

    Filtros disponibles:
      ?account=<uuid>    → transacciones donde la cuenta es origen O destino
      ?type=DEPOSIT      → filtrar por tipo (DEPOSIT, WITHDRAWAL, TRANSFER)
    """
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return TransactionCreateSerializer
        return TransactionSerializer

    def get_queryset(self):
        qs = (
            Transaction.objects
            .filter(user=self.request.user)
            .select_related(
                'account_origin',
                'account_destination',
                'category',
            )
            .order_by('-timestamp')
        )

        # Filtro por cuenta: busca en AMBOS lados (origen y destino)
        account_id = self.request.query_params.get('account')
        if account_id:
            qs = qs.filter(
                Q(account_origin__id=account_id) |
                Q(account_destination__id=account_id)
            )

        # Filtro por tipo de transacción
        tx_type = self.request.query_params.get('type')
        if tx_type:
            qs = qs.filter(type=tx_type.upper())

        return qs

    def perform_create(self, serializer):
        # No llama a serializer.save() — delega todo al service layer.
        # El service maneja la atomicidad (balance update + insert).
        self._created_tx = create_transaction(
            user=self.request.user,
            validated_data=serializer.validated_data,
        )

    def create(self, request, *args, **kwargs):
        """
        Override de create() para usar TransactionSerializer en la respuesta.

        El flow estándar de DRF retornaría la respuesta con el serializer de entrada
        (TransactionCreateSerializer), que no tiene los nombres denormalizados.
        Este override serializa la transacción creada con el serializer de lectura.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        output_serializer = TransactionSerializer(
            self._created_tx,
            context=self.get_serializer_context(),
        )
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)
