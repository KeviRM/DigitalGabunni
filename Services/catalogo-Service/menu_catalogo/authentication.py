from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed

from django.contrib.auth.models import User

class StatelessJWTAuthentication(JWTAuthentication):
    
    def get_user(self, validated_token):
        try:
            user_id = validated_token['user_id']
        except KeyError:
            raise InvalidToken(('Token contained no recognizable user identification'))
        
        
       # Creamos un usuario en memoria (no se guarda en DB)
        user = User()
        user.id = user_id
        user.pk = user_id
        user.username = f"user_{user_id}" # Nombre genérico
     
     # Extraer roles del token --claims personalizados que se agregaron een Auth
        user.is_superuser = validated_token.get('is_admin', False)
        # Asumimos staff si es admin o cocinero
        user.is_staff = validated_token.get('is_cocinero', False) or user.is_superuser
        user.is_active = validated_token.get('is_active', True)   
        
        return user
            