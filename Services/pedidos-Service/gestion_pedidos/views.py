from django.shortcuts import render
from rest_framework import viewsets, mixins
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import Pedido
from .serializers import (
    PedidoCreationSerializer, 
    PedidoEstadoSerializer,
    PedidoAdminSerializer
)


# Create your views here.

class PedidoCreationViewSet (mixins.CreateModelMixin, viewsets.GenericViewSet):
    queryset = Pedido.objects.all()
    
    serializer_class = PedidoCreationSerializer
    permission_classes = [AllowAny]
    
    
class PedidoEstadoViewSet(mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    
    queryset = Pedido.objects.all()
    serializer_class = PedidoEstadoSerializer
    lookup_field = 'order_number'
    permission_classes = [AllowAny]
    
    


###########Viewset para la gesstion de pedidos



class PedidoGestionViewSet(viewsets.ModelViewSet):
    queryset = Pedido.objects.all().order_by('-created_at').prefetch_related('details')
    serializer_class = PedidoAdminSerializer
    lookup_field = 'order_number'
    permission_classes = [AllowAny]
    
    