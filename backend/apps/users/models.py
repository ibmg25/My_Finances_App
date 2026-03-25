import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from .managers import UserManager


class User(AbstractBaseUser, PermissionsMixin):
    """
    Modelo de usuario personalizado.

    Extiende AbstractBaseUser para usar email como identificador principal
    en lugar del campo 'username' que trae Django por defecto.

    PermissionsMixin agrega los campos is_superuser, groups y user_permissions
    necesarios para que el sistema de permisos de Django y el Admin funcionen.

    IMPORTANTE: AUTH_USER_MODEL = 'users.User' debe estar en settings ANTES
    de la primera migración. Cambiarlo después requiere resetear la DB.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)

    # Moneda base para consolidar el patrimonio neto del usuario.
    # Nullable porque el usuario puede no configurarla en el momento del registro.
    # on_delete=PROTECT: no se puede borrar un Asset mientras haya usuarios usándolo.
    base_currency = models.ForeignKey(
        'assets.Asset',  # string para evitar import circular (assets no depende de users)
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='users_with_base_currency',
        db_column='base_currency_id',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = 'email'   # campo usado para el login
    REQUIRED_FIELDS = []       # campos requeridos en createsuperuser (además de email+password)

    class Meta:
        db_table = 'users'

    def __str__(self) -> str:
        return self.email
