from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer para el registro de nuevos usuarios.
    Solo se usa en POST /api/users/register/ (endpoint público).

    password es write_only: nunca aparece en ninguna respuesta.
    create() delega a UserManager.create_user() que hashea la contraseña.
    """
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['email', 'password']

    def create(self, validated_data: dict) -> User:
        return User.objects.create_user(**validated_data)


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer para ver y actualizar el perfil del usuario autenticado.
    Usado en GET y PATCH /api/users/me/

    base_currency es el único campo writable (acepta el string ID del Asset: 'USD', 'BTC', etc).
    base_currency_id es read_only: devuelve el ID del asset seleccionado sin
    que el cliente tenga que parsear un objeto anidado.
    """
    base_currency_id = serializers.CharField(
        source='base_currency.id',
        read_only=True,
        allow_null=True,
    )

    class Meta:
        model = User
        fields = ['id', 'email', 'base_currency', 'base_currency_id', 'created_at']
        read_only_fields = ['id', 'email', 'base_currency_id', 'created_at']
        # 'base_currency' queda writable: DRF lo interpreta como PrimaryKeyRelatedField
        # y acepta el string PK del Asset (ej: "USD", "BTC").
