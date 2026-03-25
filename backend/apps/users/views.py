from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from .serializers import UserRegistrationSerializer, UserProfileSerializer


class RegisterView(APIView):
    """
    POST /api/users/register/

    Endpoint público — override explícito de AllowAny para que no requiera JWT.
    No retorna el objeto usuario creado para no exponer datos innecesariamente
    (el cliente debe hacer login con /api/auth/token/ después).
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(status=status.HTTP_201_CREATED)


class MeView(APIView):
    """
    GET  /api/users/me/   → devuelve el perfil del usuario autenticado.
    PATCH /api/users/me/  → actualiza el perfil (actualmente solo base_currency).

    Hereda IsAuthenticated del global. No se declara permission_classes
    para que use el default de settings.
    """

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        # partial=True: el cliente puede enviar solo los campos que quiere cambiar,
        # sin necesidad de incluir todos los campos requeridos.
        serializer = UserProfileSerializer(
            request.user,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
