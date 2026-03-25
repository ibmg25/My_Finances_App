from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),

    # Autenticación JWT
    # POST /api/auth/token/          → recibe email+password, devuelve access+refresh token
    # POST /api/auth/token/refresh/  → recibe refresh token, devuelve nuevo access token
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path('api/', include('apps.users.urls')),
    path('api/', include('apps.assets.urls')),
    path('api/', include('apps.accounts.urls')),
    path('api/', include('apps.transactions.urls')),
]
