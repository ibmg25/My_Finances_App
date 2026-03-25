from rest_framework import serializers
from .models import Category, Transaction


class CategorySerializer(serializers.ModelSerializer):
    """
    Serializer para categorías de transacciones.

    is_system indica si la categoría es del sistema (user=None) o personalizada.
    El campo user nunca aparece en los fields — se inyecta en perform_create.
    """
    is_system = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'type', 'is_system']
        read_only_fields = ['id', 'is_system']

    def get_is_system(self, obj) -> bool:
        return obj.user_id is None


class TransactionSerializer(serializers.ModelSerializer):
    """
    Serializer de lectura para transacciones (list y retrieve).

    Los campos *_name son read_only y se resuelven con select_related en el
    queryset del ViewSet. Así la lista paginada de transacciones sigue siendo
    una sola query SQL con JOINs, sin importar cuántas transacciones haya.
    """
    account_origin_name = serializers.CharField(
        source='account_origin.name',
        read_only=True,
        allow_null=True,
    )
    account_destination_name = serializers.CharField(
        source='account_destination.name',
        read_only=True,
        allow_null=True,
    )
    category_name = serializers.CharField(
        source='category.name',
        read_only=True,
        allow_null=True,
    )

    class Meta:
        model = Transaction
        fields = [
            'id', 'type', 'amount', 'fee_amount',
            'account_origin', 'account_origin_name',
            'account_destination', 'account_destination_name',
            'category', 'category_name',
            'exchange_rate', 'timestamp', 'description',
        ]
        read_only_fields = ['id']


class TransactionCreateSerializer(serializers.ModelSerializer):
    """
    Serializer de escritura para crear transacciones (POST únicamente).

    Contiene TODA la validación de negocio en validate():
    - Validación estructural: qué cuentas son requeridas/prohibidas por tipo.
    - Validación de ownership: las cuentas deben pertenecer al usuario autenticado.
    - Validación de montos: amount > 0, fee_amount >= 0.

    El servicio create_transaction() recibe validated_data ya limpio
    y se enfoca exclusivamente en la lógica atómica de balance.
    """

    class Meta:
        model = Transaction
        fields = [
            'type', 'amount', 'fee_amount',
            'account_origin', 'account_destination',
            'category', 'exchange_rate', 'timestamp', 'description',
        ]

    def validate(self, data: dict) -> dict:
        tx_type = data.get('type')
        origin = data.get('account_origin')
        destination = data.get('account_destination')
        user = self.context['request'].user

        # ---------------------------------------------------------------
        # Validación estructural por tipo de transacción
        # ---------------------------------------------------------------
        if tx_type == Transaction.TransactionType.DEPOSIT:
            if origin is not None:
                raise serializers.ValidationError(
                    {'account_origin': 'Un DEPOSIT no debe tener cuenta de origen.'}
                )
            if destination is None:
                raise serializers.ValidationError(
                    {'account_destination': 'Un DEPOSIT requiere cuenta de destino.'}
                )

        elif tx_type == Transaction.TransactionType.WITHDRAWAL:
            if destination is not None:
                raise serializers.ValidationError(
                    {'account_destination': 'Un WITHDRAWAL no debe tener cuenta de destino.'}
                )
            if origin is None:
                raise serializers.ValidationError(
                    {'account_origin': 'Un WITHDRAWAL requiere cuenta de origen.'}
                )

        elif tx_type == Transaction.TransactionType.TRANSFER:
            if origin is None or destination is None:
                raise serializers.ValidationError(
                    'Un TRANSFER requiere tanto cuenta de origen como de destino.'
                )
            if origin == destination:
                raise serializers.ValidationError(
                    'La cuenta de origen y destino deben ser diferentes.'
                )

        # ---------------------------------------------------------------
        # Validación de ownership
        # DRF ya resolvió los FKs antes de llamar validate(), entonces
        # origin y destination son instancias de Account.
        # Usamos _id (el campo FK directo) para evitar una query adicional.
        # ---------------------------------------------------------------
        if origin is not None and origin.user_id != user.id:
            raise serializers.ValidationError(
                {'account_origin': 'La cuenta no te pertenece.'}
            )
        if destination is not None and destination.user_id != user.id:
            raise serializers.ValidationError(
                {'account_destination': 'La cuenta no te pertenece.'}
            )

        # ---------------------------------------------------------------
        # Validación de montos
        # ---------------------------------------------------------------
        amount = data.get('amount')
        if amount is not None and amount <= 0:
            raise serializers.ValidationError(
                {'amount': 'El monto debe ser positivo.'}
            )

        fee = data.get('fee_amount')
        if fee is not None and fee < 0:
            raise serializers.ValidationError(
                {'fee_amount': 'La comisión no puede ser negativa.'}
            )

        return data
