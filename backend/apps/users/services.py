from typing import Any
from django.contrib.auth import get_user_model

User = get_user_model()


def register_user(email: str, password: str) -> Any:
    """Crea un nuevo usuario con contraseña hasheada."""
    return User.objects.create_user(email=email, password=password)


def update_profile(user: Any, validated_data: dict) -> Any:
    """
    Actualiza los campos del perfil del usuario.
    En MVP el único campo actualizable es base_currency.
    """
    for attr, value in validated_data.items():
        setattr(user, attr, value)
    user.save()
    return user
