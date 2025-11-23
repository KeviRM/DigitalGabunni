"""
URL configuration for MicroservicioAuth project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include

from rest_framework.routers import DefaultRouter

from usuarios.views import RegistroView, GoogleLoginView, CocineroManagementViewSet

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from usuarios.serializers import CustomTokenObtainPairSerializer


router = DefaultRouter()
router.register(r'cocineros', CocineroManagementViewSet, basename='gestion_cocineros')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/gestion/', include(router.urls)),
    #Endpoint principal para obtener el Access y Refresh Token
    path('api/token/', TokenObtainPairView.as_view(serializer_class=CustomTokenObtainPairSerializer), name='token_obtain_pair'),
    
    #### Enpoint Renovar el Access Token
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    
    
    path('api/registro/', RegistroView.as_view(), name='registro_usuario'),
    
    path('api/google-login/', GoogleLoginView.as_view(), name='google_login'),
    
    ####urls de Django Auth => para la gestion de usus
    
    path('api/auth/', include('django.contrib.auth.urls')),
]
