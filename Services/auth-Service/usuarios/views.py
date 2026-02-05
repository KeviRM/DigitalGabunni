from django.shortcuts import render
from rest_framework import generics, views, status, response, viewsets
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from .serializers import RegistroSerializer
from django.contrib.auth import get_user_model

from django.contrib.auth.models import User
from .serializers import CocineroSerializer, CajeroSerializer
import requests
from rest_framework_simplejwt.tokens import RefreshToken

#Importar serializer para incluir roles
from .serializers import CustomTokenObtainPairSerializer



# Create your views here.

User = get_user_model()
class RegistroView(generics.ListCreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegistroSerializer










class CocineroManagementViewSet(viewsets.ModelViewSet):
   
    serializer_class = CocineroSerializer
    permission_classes = [IsAdminUser] 
    def get_queryset(self):
        # Filtrar solo usuarios que pertenecen al grupo Cocinero
        return User.objects.filter(groups__name='Cocinero')



class CajeroManagementViewSet(viewsets.ModelViewSet):
   
    serializer_class = CajeroSerializer
    permission_classes = [IsAdminUser] 
    def get_queryset(self):
        # Filtrar solo usuarios que pertenecen al grupo Cajero
        return User.objects.filter(groups__name='Cajero')








class GoogleLoginView(views.APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        google_access_token = request.data.get('access_token')
        
        if not google_access_token:
            return response.Response({'error': 'Falta de Token de acceso'}, status=status.HTTP_400_BAD_REQUEST)
        
        
        
        user_info_url = "https://www.googleapis.com/oauth2/v3/userinfo"
        
        res = requests.get(user_info_url, params={'access_token': google_access_token})
        
        if res.status_code != 200:
            return response.Response({'error': 'Token de Google inválido'}, status=status.HTTP_400_BAD_REQUEST)
        
        user_data = res.json()
        email = user_data.get('email')
        first_name = user_data.get('given_name', '')
        
        
        if not email:
            return response.Response({'error': 'Google no proporcionó el email'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            
            
            username = email.split('@')[0] #La parte local del correo como usuario base
            
            # Asegurar username único
            if User.objects.filter(username=username).exists():
                username = f"{username}_{User.objects.count()}"
                
                
            user = User.objects.create_user(
                username=username,
                email=email,
                first_name=first_name,
                password=None # El usuario solo entra con google, o sea esta sin contraseña local
            )
            user.set_unusable_password() # Seguridad extra
            user.save()
            
        #####Generar el propio JWTs --para icluir roles--
        
        refresh = RefreshToken.for_user(user)
        
        
        #Añadir los claims de roles
        refresh['is_admin'] = user.is_superuser
        refresh['is_cocinero'] = user.groups.filter(name='Cocinero').exists() or (user.is_staff and not user.is_superuser)
        refresh['is_active'] = user.is_active
        
        return response.Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_200_OK)
        







class MeView(views.APIView):
    """Devuelve los datos del usuario autenticado"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Puedes crear un serializer específico si quieres mostrar más o menos datos
        data = {
            'id': request.user.id,
            'username': request.user.username,
            'email': request.user.email,
            'first_name': request.user.first_name,
            'last_name': request.user.last_name,
            'date_joined': request.user.date_joined.strftime('%Y-%m-%d'),
            'rol': 'Administrador' if request.user.is_superuser else 'Cliente'
        }
        return response.Response(data, status=status.HTTP_200_OK)


