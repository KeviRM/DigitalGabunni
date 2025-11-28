import json
from django.shortcuts import render
from requests import request
from rest_framework import viewsets, mixins, status, views, response
from rest_framework.permissions import AllowAny, IsAuthenticated

from django.db.models import Sum, Count

from django.db.models.functions import ExtractDay, ExtractMonth, ExtractYear
from django.db.models.functions import TruncDate

from django.utils import timezone
from datetime import timedelta
from datetime import datetime

import csv
from django.http import HttpResponse

from .models import Pedido, PushSubscription
from .serializers import (
    PedidoCreationSerializer, 
    PedidoEstadoSerializer,
    PedidoAdminSerializer,
    PushSubscriptionSerializer
)
from .filters import PedidoFilter

from pywebpush import webpush, WebPushException



import mercadopago

from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response


#####chanels
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync


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
        
        # DEBUG TEMPORAL: Imprimir el usuario para ver si llega autenticado
        print(f"Usuario solicitante: {self.request.user}, ID: {self.request.user.id}")
        
        if self.request.user.is_anonymous:
            return Pedido.objects.none() # Retorna vacío si no hay usuario
        # Filtrar solo los pedidos del usuario actual
        return Pedido.objects.filter(usuario_id=self.request.user.id).order_by('-created_at')






class SavePushSubscriptionView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PushSubscriptionSerializer(data=request.data)
        if serializer.is_valid():
            # Guardar o actualizar suscripción para este usuario
            PushSubscription.objects.update_or_create(
                usuario_id=request.user.id,
                defaults=serializer.validated_data
            )
            return Response({"status": "Suscripción guardada"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)








###########Viewset para la gesstion de pedidos



class PedidoGestionViewSet(viewsets.ModelViewSet):
    queryset = Pedido.objects.all().order_by('-created_at').prefetch_related('details')
    serializer_class = PedidoAdminSerializer
    lookup_field = 'order_number'
    permission_classes = [IsAuthenticated]
    filterset_class = PedidoFilter
    
    def perform_update(self, serializer):
        pedido = serializer.save()
        
        if pedido.status == 'LISTO' and pedido.usuario_id:
            self.enviar_notificacion_push(pedido)
            
        # Notificar a WebSockets 
        channel_layer = get_channel_layer()
        
        data_pedido = {
            'order_number': str(pedido.order_number),
            'status': pedido.status,
            'client_name': pedido.client_name,
            
            # Añade otros campos necesarios para la cocina
        }
        
        # AVISAR AL GRUPO cocina
        async_to_sync(channel_layer.group_send)(
            'grupo_cocina', # Nombre del grupo 
            {
                'type': 'pedido_update', # Método del consumer a ejecutar
                'pedido': data_pedido
            }
        )
        
    
    def enviar_notificacion_push(self, pedido):
        try:
            sub = PushSubscription.objects.filter(usuario_id = pedido.usuario_id).first()
            
            if not sub:
                return
            
            
            subscription_info ={
                "endpoint": sub.endpoint,
                "keys": {
                    "p256dh": sub.p256dh,
                    "auth": sub.auth
                }
            }
            
            payload = json.dumps({
                "title": "¡Tu pedido está listo!",
                "body": f"El pedido #{str(pedido.order_number)[:8]} ya está listo para recoger/enviar.",
                "url": f"/pedido/estado/{pedido.order_number}" # Para abrir la app al tocar
            })
            
            webpush(
                subscription_info=subscription_info,
                data=payload,
                vapid_private_key=settings.WEBPUSH_SETTINGS['VAPID_PRIVATE_KEY'],
                vapid_claims={"sub": settings.WEBPUSH_SETTINGS['VAPID_ADMIN_EMAIL']}
            )
            print(f"Notificacion enviada al usuario {pedido.usuario_id}")
            
        except WebPushException as ex:
            print(f"Error enviando push: {ex}")
        except Exception as e:
            print(f"Error general Push: {e}")
    
    
    
    
    ########    MERCADO PAGO 
    
class CreatePaymentPreference(APIView):
    def post(self, request):
            
        order_id = request.data.get('order_id')
            
        try:
            pedido = Pedido.objects.get(order_number=order_id)
        except Pedido.DoesNotExist:
            return Response({'error': 'Pedido no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': f'Error buscando pedido: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
        
        
        
        
        if not settings.MERCADO_PAGO_ACCESS_TOKEN:
             return Response({'error': 'Token de Mercado Pago no configurado'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            #configurar SDK
            
        sdk = mercadopago.SDK(settings.MERCADO_PAGO_ACCESS_TOKEN)
            
            
            #Item para la preferencia
            
        items = [ ]
            
        for detalle in pedido.details.all():
                
            items.append({
            "title": str(detalle.product_name),
            "quantity": int(detalle.quantity),
            "unit_price": float(detalle.unit_price),
            "currency_id": "MXN"
            })
                
                
            #Datos de la preferencia
            
        preference_data = {
            "items" : items,
                
            "payer" : {
                "name": str(pedido.client_name),
                "email": str(pedido.email),
                "phone": {
                    "area_code": "52",
                    "number": str(pedido.phone_number)
                }
                    
            },
            "back_urls": {
                "success": "http://localhost:5173/pedido/exito",
                "failure": "http://localhost:5173/pedido/fallo",
                "pending": "http://localhost:5173/pedido/pendiente"
            },
                
            # "auto_return": "approved",
            "external_reference": str(pedido.order_number),
                
        }
        
        
        # --- DEBUG: IMPRIMIR LO QUE SE ENVÍA ---
        print("\n--- DATOS ENVIADOS A MERCADO PAGO ---")
        print(json.dumps(preference_data, indent=2))
        print("-------------------------------------\n")
        # ---------------------------------------
            
        try:  
            preference_response = sdk.preference().create(preference_data)
            
            
            # Verificar si Mercado Pago devolvió un error
            if preference_response["status"] != 201:
                print("Error MP:", preference_response) # Ver en consola de Django
                return Response({'error': 'Error al crear preferencia en MP', 'detalle': preference_response}, status=status.HTTP_400_BAD_REQUEST)
                
            
            
            preference = preference_response["response"]
                
                
            return Response({
                'preference_id': preference['id'],
                'init_point': preference['init_point'] ###URL DE pago
            })
        except Exception as e:
            print(f"Excepción interna: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        
        
        
        
        
    
    
    
    
    
    
    
    
    
    
    
    
    
    
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
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    #########################Reportesss
    
    
class ReporteVentasCSV(views.APIView):
    
        permission_classes = [IsAuthenticated]

        def get(self, request, format=None):
            fecha_inicio_str = request.query_params.get('fecha_inicio')
            fecha_fin_str = request.query_params.get('fecha_fin')

           
            pedidos = Pedido.objects.filter(status__in=['ENTREGADO', 'LISTO', 'CONFIRMADO']).prefetch_related('details')

            if fecha_inicio_str:
                pedidos = pedidos.filter(created_at__date__gte=fecha_inicio_str)
            if fecha_fin_str:
                pedidos = pedidos.filter(created_at__date__lte=fecha_fin_str)

            pedidos = pedidos.order_by('-created_at')

            # 3. Crear la respuesta HTTP con tipo de contenido CSV
            response = HttpResponse(content_type='text/csv')
            filename = f"reporte_ventas_{datetime.now().strftime('%Y%m%d_%H%M')}.csv"
            response['Content-Disposition'] = f'attachment; filename="{filename}"'

            # 4. Escribir el CSV
            writer = csv.writer(response)
            
            # Encabezados
            writer.writerow(['ID Pedido', 'Fecha', 'Cliente', 'Teléfono', 'Tipo Entrega', 'Estado', 'Total ($)', 'Items'])

            # Filas de datos
            for pedido in pedidos:
                # Resumen de items en una celda
                items_str = ", ".join([f"{d.quantity}x {d.product_name}" for d in pedido.details.all()])
                
                fecha_str = pedido.created_at.strftime('%Y-%m-%d %H:%M') if pedido.created_at else "N/A"
                
                writer.writerow([
                    str(pedido.order_number),
                    fecha_str,
                    pedido.client_name,
                    pedido.phone_number,
                    pedido.type_delivery,
                    pedido.status,
                    pedido.amount,
                    items_str
                ])

            return response
        