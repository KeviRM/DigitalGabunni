from django.shortcuts import render
from rest_framework import viewsets, mixins, status, views, response
from rest_framework.permissions import AllowAny, IsAuthenticated

from django.db.models import Sum, Count

from django.db.models.functions import ExtractDay, ExtractMonth, ExtractYear
from django.db.models.functions import TruncDate

from django.utils import timezone
from datetime import timedelta

from .models import Pedido
from .serializers import (
    PedidoCreationSerializer, 
    PedidoEstadoSerializer,
    PedidoAdminSerializer
)
from .filters import PedidoFilter


# Create your views here.

class PedidoCreationViewSet (mixins.CreateModelMixin, viewsets.GenericViewSet):
    
    queryset = Pedido.objects.all()
    permission_classes = [IsAuthenticated]
    serializer_class = PedidoCreationSerializer
    
    def perform_create(self, serializer):
        serializer.save(usuario_id=self.request.user.id)
    
    
    
    
class PedidoEstadoViewSet(mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    
    queryset = Pedido.objects.all()
    serializer_class = PedidoEstadoSerializer
    lookup_field = 'order_number'
    permission_classes = [AllowAny]
    
    


#
class MisPedidosViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PedidoEstadoSerializer # Reusamos el serializer de lectura
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Filtrar solo los pedidos del usuario actual
        return Pedido.objects.filter(usuario_id=self.request.user.id).order_by('-fecha_creacion')











###########Viewset para la gesstion de pedidos



class PedidoGestionViewSet(viewsets.ModelViewSet):
    queryset = Pedido.objects.all().order_by('-created_at').prefetch_related('details')
    serializer_class = PedidoAdminSerializer
    lookup_field = 'order_number'
    permission_classes = [IsAuthenticated]
    filterset_class = PedidoFilter
    
    
    
    
    
    
    
    
    
    
    
    
    
class AnalyticsView(views.APIView):
    """
    API para proporcionar métricas de ganancias y ventas al Panel de Administración.
    """
    permission_classes = [AllowAny] 

    def get(self, request, format=None):
        # Definir el rango de fechas (ej: últimos 30 días, o según filtros futuros)
        dias_pasados = 30
        fecha_inicio = timezone.now() - timedelta(days=dias_pasados)
        
        # Consultas y Agregaciones Básicas
        
        # Ganancia Total histórica
        ganancia_total = Pedido.objects.filter(status__in=['ENTREGADO', 'LISTO']).aggregate(
            total=Sum('amount')
        )['total'] or 0.00
        
        # Total de Órdenes (Histórico)
        ordenes_totales = Pedido.objects.all().count()
        
        # Ganancia y Órdenes en el último periodo (últimos 30 días)
        pedidos_recientes = Pedido.objects.filter(
            created_at__gte=fecha_inicio,
            status__in=['ENTREGADO', 'LISTO']
        )
        
        ganancia_reciente = pedidos_recientes.aggregate(total=Sum('amount'))['total'] or 0.00
        ordenes_recientes = pedidos_recientes.count()
        
        # Datos para Gráfica Diaria (Ganancias Diarias)
        # Agrupa los pedidos por día y suma los montos
        ganancias_por_dia = Pedido.objects.filter(
            created_at__gte=fecha_inicio,
            status__in=['ENTREGADO', 'LISTO']
        ).annotate(
            dia=TruncDate('created_at')
        ).values('dia').annotate(
            ganancia=Sum('amount')
        ).order_by('dia')
        
        # Cálculo de Clientes
        # NOTA: Si usáramos un campo 'cliente' que no sea NULL en Pedido, usaríamos Count(Distinct('cliente'))
        # Por ahora, usamos el número de pedidos confirmados como proxy de actividad:
        clientes_activos = Pedido.objects.all().values('client_name').distinct().count()

        #  Formato de la Respuesta JSON
        data = {
            # Indicadores de Ventas (Métricas)
            'metricas': {
                'ganancia_total_historica': float(ganancia_total),
                'ordenes_totales': ordenes_totales,
                'ganancia_ultimos_dias': float(ganancia_reciente),
                'ordenes_ultimos_dias': ordenes_recientes,
                'clientes_activos': clientes_activos,
            },
            # Datos para Gráfica
            'grafica_diaria': [
                {'dia': item['dia'].strftime('%Y-%m-%d'), 'ganancia': float(item['ganancia'])}
                for item in ganancias_por_dia
            ],
            # PENDIENTE: Gráficas Semanales/Mensuales más complejas
        }

        return response.Response(data, status=status.HTTP_200_OK)
    