from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Admin customizado para AbstractBaseUser.
    Django's UserAdmin por defecto asume campo 'username' que no existe
    en nuestro modelo, por eso hay que redefinir fieldsets y add_fieldsets.
    """
    ordering = ('email',)
    list_display = ('email', 'base_currency', 'created_at', 'is_staff', 'is_active')
    search_fields = ('email',)
    list_filter = ('is_staff', 'is_active', 'base_currency')

    # Campos visibles al editar un usuario existente
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Perfil', {'fields': ('base_currency',)}),
        ('Permisos', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Fechas', {'fields': ('last_login', 'created_at')}),
    )
    readonly_fields = ('created_at', 'last_login')

    # Campos visibles al crear un usuario nuevo desde el admin
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2'),
        }),
    )
    filter_horizontal = ('groups', 'user_permissions')
