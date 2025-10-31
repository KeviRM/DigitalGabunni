from django.shortcuts import render
from rest_framework import viewsets, mixins
from rest_framework.permissions import AllowAny
from .models import Pedido
from .serializers import PedidoCreationSerializer, PedidoEstadoSerializer


# Create your views here.

class PedidoCreationViewSet (mixins.CreateModelMixin, viewsets.GenericViewSet):
    queryset = Pedido.objects.all()
    
    serializer_class = PedidoCreationSerializer
    permission_classes = [AllowAny]
    
    
class PedidoEstadoViewSet(mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    
    queryset = Pedido.objects.all()
    serializer_class = PedidoEstadoSerializer
    lookup_field ="numero_pedido"
    permission_classes = [AllowAny]
    
    