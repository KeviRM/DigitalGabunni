import json
from django.shortcuts import render
from requests import request
from rest_framework import viewsets, mixins, status, views, response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import action

from django.db.models import Sum, Count

from django.db.models.functions import ExtractDay, ExtractMonth, ExtractYear
from django.db.models.functions import TruncDate

from django.utils import timezone
from datetime import timedelta
from datetime import datetime

from django.db import transaction

import csv
from django.http import HttpResponse

from .models import DetallePedido, Pedido, PushSubscription, SesionCaja
from .serializers import (
    PedidoCreationSerializer, 
    PedidoEstadoSerializer,
    PedidoAdminSerializer,
    PushSubscriptionSerializer,
    SesionCajaSerializer
)
from .filters import PedidoFilter

""" from django.contrib.auth.models import User, Group """

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

        origen_request = self.request.data.get('origen', 'APP')
        estado_inicial = 'PENDIENTE'


        if origen_request == 'KIOSCO':
            estado_inicial = 'ESPERANDO_PAGO'



        pedido = serializer.save(
            usuario_id=self.request.user.id,
            status=estado_inicial,
            origen = origen_request
            
        )
        
        
        channel_layer = get_channel_layer()
        

        data_pedido = {
            'order_number': str(pedido.order_number),
            'status': pedido.status,
            'client_name': pedido.client_name,
            'amount': str(pedido.amount) 
        }
        
        
        async_to_sync(channel_layer.group_send)(
            f'grupo_{str(pedido.order_number)}', 
            {
                'type': 'pedido_update', 
                'pedido': data_pedido
            }
        )

    
   
    
    
    
    
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
    queryset = Pedido.objects.all().order_by('-created_at').prefetch_related('details').exclude(status__in=['PENDIENTE', 'ESPERANDO_PAGO'])
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
        
        numero_pedido_str = str(pedido.order_number)
        
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
        
        
        async_to_sync(channel_layer.group_send)(
            f'grupo_{numero_pedido_str}', 
            {'type': 'pedido_update', 'pedido': data_pedido}
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
    permission_classes = [IsAuthenticated]
    def post(self, request):
            
        order_id = request.data.get('order_id')
            
        try:
            pedido = Pedido.objects.get(order_number=order_id, usuario_id = request.user.id)
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
            
            ##notification_url": "https://gabunny.agenciakeops.com/api/v1/pedidos/webhook/",
            "notification_url": "https://alaine-nongrounding-subconically.ngrok-free.dev/api/v1/pedidos/webhook/",
            "payment_methods": {
                "excluded_payment_types": [
                    {"id": "ticket"}, # Excluye OXXO/Pago en efectivo diferido
                    {"id": "atm"}
                ],
                "installments": 1 # Evitar meses sin intereses si no quieres
            },
            "back_urls": {
                "success": "https://gabunny.agenciakeops.com/pedido/exito",
                "failure": "https://gabunny.agenciakeops.com/pedido/fallo",
                "pending": "https://gabunny.agenciakeops.com/pedido/pendiente"
            },
                
            "auto_return": "approved",
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
        
        
        
        
        
        
    
    
class MercadoPagoWebhook(APIView):
    
    permission_classes = [AllowAny] # <--- AGREGAR ESTO (Puerta abierta para MP)
    authentication_classes = []     # <--- Opcional: Desactivar auth para esta vista
    """
    Recibe notificaciones de Mercado Pago (IPN / Webhooks)
    y actualiza el estado del pedido en tiempo real.
    """
    def post(self, request):
        # 1. Obtener parámetros de la notificación
        topic = request.query_params.get('topic') or request.data.get('type')
        payment_id = request.query_params.get('id') or request.data.get('data', {}).get('id')

        print(f" Webhook recibido: {topic} | ID: {payment_id}")

        # Solo nos interesan notificaciones de pagos
        if topic == 'payment':
            try:
                sdk = mercadopago.SDK(settings.MERCADO_PAGO_ACCESS_TOKEN)
                
                # 2. Consultar a Mercado Pago el estado REAL del pago (Seguridad)
                payment_info = sdk.payment().get(payment_id)
                response = payment_info["response"]
                
                status_payment = response.get('status')
                external_reference = response.get('external_reference') # Este es nuestro numero_pedido (UUID)

                if status_payment == 'approved':
                    print(f" Pago Aprobado para Pedido {external_reference}")
                    self.procesar_pago_exitoso(external_reference)
                
                elif status_payment == 'pending':
                    print(f" Pago Pendiente para Pedido {external_reference}")
                    # Opcional: Podrías marcar el pedido como 'PROCESANDO_PAGO'

            except Exception as e:
                print(f" Error procesando webhook: {str(e)}")
                # Retornamos 200 para que MP no siga reintentando infinitamente si es un error interno nuestro
                return Response(status=status.HTTP_200_OK)

        # Siempre responder 200 OK a Mercado Pago para confirmar recepción
        return Response(status=status.HTTP_200_OK)

    def procesar_pago_exitoso(self, order_number):
        try:
            pedido = Pedido.objects.get(order_number=order_number)

            # 3. IDEMPOTENCIA: Si el pedido YA está confirmado, evitamos procesarlo doble
            # Aceptamos pedidos que vengan como 'PENDIENTE' (App) o 'ESPERANDO_PAGO' (Kiosco)
            if pedido.status == 'CONFIRMADO':
                print(" El pedido ya estaba procesado y confirmado. Saltando...")
                return

            # 4. Actualizar estado a confirmado
            pedido.status = 'CONFIRMADO' 
            pedido.save()

            # 5. Notificar vía WebSocket
            channel_layer = get_channel_layer()
            data_pedido = {
                'order_number': str(pedido.order_number),
                'status': pedido.status,
                'client_name': pedido.client_name,
            }

            async_to_sync(channel_layer.group_send)(
                'grupo_cocina', 
                {'type': 'pedido_update', 'pedido': data_pedido}
            )
            
             # A) Avisar al canal GENERAL (El que configuramos en React para la Caja y Kiosco)
             
            async_to_sync(channel_layer.group_send)(
                'pedidos', # Asegúrate de que 'pedidos' es el nombre de tu grupo general en routing/consumers
                {'type': 'pedido_update', 'pedido': data_pedido}
            )
            
            # B) Avisar al canal ESPECÍFICO (Por si tienes a alguien escuchando la ruta privada)
            async_to_sync(channel_layer.group_send)(
                f'grupo_{str(pedido.order_number)}', 
                {'type': 'pedido_update', 'pedido': data_pedido}
            )
            
            print(f" Notificaciones WebSocket enviadas con éxito para {order_number}")

        except Pedido.DoesNotExist:
            print(f" Pedido {order_number} no encontrado en DB")
    
    
    
    
    
    
    
    
    
    
    
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
        






class CajaViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def pendientes(self, request):


        tiempo_limite = timezone.now() - timedelta(minutes=15)

        pedidos_caducados = Pedido.objects.filter(
            status='ESPERANDO_PAGO',
            created_at__lte=tiempo_limite
        )

        if pedidos_caducados.exists():
            pedidos_caducados.update(status='CANCELADO')


        pedidos = Pedido.objects.filter(status='ESPERANDO_PAGO').order_by('created_at')
        serializer = PedidoEstadoSerializer(pedidos, many=True)
        return Response(serializer.data)
    



# ---  ENDPOINT PARA CANCELACIÓN MANUAL ---
    @action(detail=False, methods=['patch'], url_path='(?P<order_number>[^/.]+)/cancelar')
    def cancelar_pedido(self, request, order_number=None):
        try:
            pedido = Pedido.objects.get(order_number=order_number)
            pedido.status = 'CANCELADO'
            pedido.save()
            
            # Opcional: Podrías emitir un WebSocket aquí para que la cocina o el kiosco se enteren
            
            return Response({"status": "Pedido cancelado correctamente"}, status=200)
        except Pedido.DoesNotExist:
            return Response({'error': 'Pedido no encontrado'}, status=404)





    @action(detail=False, methods=['post'], url_path='(?P<order_number>[^/.]+)/confirmar_pago')
    def confirmar_pago(self, request, order_number=None):
        try:
            pedido = Pedido.objects.get(order_number=order_number)
                    
                    
            monto_recibido = request.data.get('monto_recibido')
            metodo_pago = request.data.get('metodo_pago', 'EFECTIVO')
                    
                    
            sesion_actual = SesionCaja.objects.filter(
                usuario_id=request.user.id, 
                estado='ABIERTA'
                ).first()

                    
            if sesion_actual:
                pedido.sesion_caja = sesion_actual
            else:
                        
                print(f"ADVERTENCIA: El usuario {request.user.id} cobró sin abrir caja.")

                    
            pedido.monto_recibido = monto_recibido
            pedido.metodo_pago = metodo_pago
                    
                    # Calcular cambio
            if monto_recibido and metodo_pago == 'EFECTIVO':
                pedido.cambio_dado = float(monto_recibido) - float(pedido.amount)
            else:
                pedido.cambio_dado = 0
                    
                    
            pedido.status = 'CONFIRMADO' 
            pedido.save()

                    
            channel_layer = get_channel_layer()
            data_pedido = {
                'order_number': str(pedido.order_number),
                'status': pedido.status,
                'client_name': pedido.client_name,
                'daily_sequence': pedido.daily_sequence
            }



            # GRUPO COCINA
            async_to_sync(channel_layer.group_send)(
                'grupo_cocina', 
                {'type': 'pedido_update', 'pedido': data_pedido}
            )

            # GRUPO CLIENTE (Para que el Kiosko muestre "¡Pago Exitoso!")
            async_to_sync(channel_layer.group_send)(
                f'grupo_{str(pedido.order_number)}', 
                {'type': 'pedido_update', 'pedido': data_pedido}
            )


            return Response({
                'status': 'Pago registrado correctamente',
                'caja_id': sesion_actual.id if sesion_actual else None
            })

        except Pedido.DoesNotExist:
            return Response({'error': 'Pedido no encontrado'}, status=404)
        

   


    @action(detail=False, methods=['put'], url_path='(?P<order_number>[^/.]+)/editar')
    def editar_orden(self, request, order_number=None):
        try:
            with transaction.atomic():
                pedido = Pedido.objects.select_for_update().get(order_number=order_number)
                
                nuevo_total = request.data.get('amount')
                if nuevo_total is not None:
                    pedido.amount = nuevo_total
                
                cliente = request.data.get('client_name')
                if cliente:
                    pedido.client_name = cliente

                pedido.save()

                #  Borra los detalles anteriores 
                pedido.details.all().delete()

                ##crea nuevos detalles
                items_carrito = request.data.get('items_carrito', [])
                
                for item in items_carrito:
                    DetallePedido.objects.create(
                        order=pedido,  
                        product_name=item.get('product_name'),
                        quantity=item.get('quantity'),
                        unit_price=item.get('unit_price'),
                        personalizacion_json=item.get('personalizacion_json') 
                    )

                channel_layer = get_channel_layer()
                data_pedido = {
                    'order_number': str(pedido.order_number),
                    'status': pedido.status,
                    'client_name': pedido.client_name,
                    'daily_sequence': pedido.daily_sequence
                }

                async_to_sync(channel_layer.group_send)(
                    'grupo_cocina', 
                    {
                        'type': 'pedido_update', 
                        'pedido': data_pedido
                    }
                )

                return Response({
                    "status": "Orden editada correctamente",
                    "order_number": str(pedido.order_number),
                    "amount": pedido.amount
                }, status=200)

        except Pedido.DoesNotExist:
            return Response({'error': 'El pedido que intentas editar no existe.'}, status=404)
        except Exception as e:
            print(f"Error al editar orden: {str(e)}")
            return Response({'error': f'Error interno al editar: {str(e)}'}, status=400)








class SesionCajaViewSet(viewsets.ModelViewSet):
    queryset = SesionCaja.objects.all()
    serializer_class = SesionCajaSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(usuario_id=self.request.user.id)

    @action(detail=False, methods=['get'])
    def resumen_actual(self, request):
        
        sesion = SesionCaja.objects.filter(usuario_id=request.user.id, estado='ABIERTA').first()
        
        if not sesion:
            return Response({'error': 'No tienes una caja abierta'}, status=404)

        # Calcular totales sumando los pedidos vinculados a esta sesión
        ventas_efectivo = sesion.pedidos.filter(metodo_pago='EFECTIVO', status='CONFIRMADO').aggregate(Sum('monto_recibido'))['monto_recibido__sum'] or 0
        
        # suma los montos de venta real.
        
        total_ventas_efectivo = sesion.pedidos.filter(metodo_pago='EFECTIVO', status='CONFIRMADO').aggregate(Sum('monto_recibido'))['monto_recibido__sum'] or 0
        # Resta el cambio entregado para saber la venta neta real en caja
        total_cambios = sesion.pedidos.filter(metodo_pago='EFECTIVO', status='CONFIRMADO').aggregate(Sum('cambio_entregado'))['cambio_entregado__sum'] or 0
        efectivo_neto = float(total_ventas_efectivo) - float(total_cambios)

        ventas_tarjeta = sesion.pedidos.filter(metodo_pago='TARJETA', status='CONFIRMADO').aggregate(Sum('monto_recibido'))['monto_recibido__sum'] or 0

        total_esperado = float(sesion.fondo_inicial) + efectivo_neto + float(ventas_tarjeta)

        return Response({
            'fondo_inicial': sesion.fondo_inicial,
            'ventas_efectivo': efectivo_neto,
            'ventas_tarjeta': ventas_tarjeta,
            'total_esperado': total_esperado,
            'sesion_id': sesion.id
        })

    # Endpoint para Cerrar la Caja 
    # URL: /api/gestion_pedidos/caja/{id}/cerrar/
    @action(detail=True, methods=['post'])
    def cerrar(self, request, pk=None):
        sesion = self.get_object()
        
      
        total_real_efectivo = request.data.get('total_real_efectivo', 0)
        total_real_tarjeta = request.data.get('total_real_tarjeta', 0)
        
        
        ventas_efectivo = sesion.pedidos.filter(metodo_pago='EFECTIVO', status='CONFIRMADO').aggregate(Sum('monto_recibido'))['monto_recibido__sum'] or 0
        total_cambios = sesion.pedidos.filter(metodo_pago='EFECTIVO', status='CONFIRMADO').aggregate(Sum('cambio_entregado'))['cambio_entregado__sum'] or 0
        efectivo_sistema = float(ventas_efectivo) - float(total_cambios)
        tarjeta_sistema = sesion.pedidos.filter(metodo_pago='TARJETA', status='CONFIRMADO').aggregate(Sum('monto_recibido'))['monto_recibido__sum'] or 0

        sesion.total_sistema_efectivo = efectivo_sistema
        sesion.total_sistema_tarjeta = tarjeta_sistema
        sesion.total_real_efectivo = total_real_efectivo
        sesion.total_real_tarjeta = total_real_tarjeta
        
        # Calcular Diferencias
        sesion.diferencia_efectivo = float(total_real_efectivo) - (float(sesion.fondo_inicial) + efectivo_sistema)
        
        sesion.diferencia_tarjeta = float(total_real_tarjeta) - float(tarjeta_sistema)
        
        sesion.fecha_fin = timezone.now()
        sesion.estado = 'CERRADA'
        sesion.save()
        
        return Response({'status': 'Caja cerrada correctamente', 'diferencia_total': sesion.diferencia_efectivo + sesion.diferencia_tarjeta})
    
    