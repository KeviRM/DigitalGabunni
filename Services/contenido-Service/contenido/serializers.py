from rest_framework import serializers
from .models import InformacionTienda, MensajeContacto

class InformacionTiendaSerializer(serializers.ModelSerializer):
    class Meta:
        model = InformacionTienda
        fields = '__all__'

class MensajeContactoSerializer(serializers.ModelSerializer):
    class Meta:
        model = MensajeContacto
        fields = '__all__'
        read_only_fields = ['fecha_creacion']
