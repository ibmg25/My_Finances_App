from django.contrib.auth.base_user import BaseUserManager


class UserManager(BaseUserManager):
    """
    Manager personalizado para el modelo User.

    Es necesario porque Django's AbstractBaseUser no asume un campo 'username',
    entonces hay que decirle explícitamente cómo crear usuarios usando 'email'.

    Se separa en su propio archivo para evitar imports circulares:
    models.py importa managers.py, y managers.py no importa nada de models.py.
    """

    def create_user(self, email: str, password: str | None = None, **extra_fields):
        if not email:
            raise ValueError('El email es obligatorio.')
        email = self.normalize_email(email)  # minúsculas en el dominio
        user = self.model(email=email, **extra_fields)
        user.set_password(password)  # hashea la contraseña, nunca guardar en texto plano
        user.save(using=self._db)
        return user

    def create_superuser(self, email: str, password: str, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)
