from rest_framework import serializers
from .models import InformacionTienda

class InformacionTiendaSerializer(serializers.ModelSerializer):
    class Meta:
        model = InformacionTienda
        fields = '__all__'
