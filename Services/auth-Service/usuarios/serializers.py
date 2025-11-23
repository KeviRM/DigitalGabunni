from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers

from django.contrib.auth.models import User, Group
from django.contrib.auth.password_validation import validate_password


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    
    def get_token(cls, user):
        
        token = super().get_token(user)
        
    
        token['is_admin'] = user.is_superuser
        token['is_cocinero'] = user.groups.filter(name='Cocinero').exists() or (user.is_staff and not user.is_superuser)
        token['is_active'] = user.is_active 
        
        return token
    

class RegistroSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only= True, required= True, validators= [validate_password])
    password2 = serializers.CharField(write_only=True, required= True)
    
    phone_number = serializers.CharField(max_length= 20, required= False, allow_blank=True)
    
    
    
    class Meta:
        model = User
    
        fields = ('username', 'email', 'password', 'password2', 'phone_number', 'first_name')  
    
    def validate(self, attrs):
        
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Las Contraseñas no coinciden."})
        
        attrs.pop('password2')
        return attrs 
    
    
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            is_active=True, 
        )
        
        
        return user
    
    
class CocineroSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'first_name')

    def create(self, validated_data):
        # Crear usuario estándar
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            is_staff=True,
            is_active=True
        )
        
        # Asignar al grupo 'Cocinero'
        group, _ = Group.objects.get_or_create(name='Cocinero')
        user.groups.add(group)
        
        return user