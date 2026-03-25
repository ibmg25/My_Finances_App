from rest_framework.permissions import BasePermission


class IsOwner(BasePermission):
    """
    Permiso reutilizable: solo el dueño de un objeto puede acceder a él.
    Uso: permission_classes = [IsAuthenticated, IsOwner]

    Requiere que el objeto tenga un campo 'user' que apunte al usuario dueño.
    """

    def has_object_permission(self, request, view, obj) -> bool:
        return obj.user == request.user
