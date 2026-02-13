from rest_framework import serializers
from .models import Pedido, DetallePedido, PushSubscription, SesionCaja


class DetallePedidoSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetallePedido
        fields = ['product_name', 'quantity', 'unit_price', 'personalizacion_json' ]
        


class PedidoCreationSerializer(serializers.ModelSerializer):
    
    items_carrito = DetallePedidoSerializer(many= True, write_only=True)
    
    
    class Meta:
        model = Pedido
        
        fields = [
            'order_number',
            'daily_sequence',
            'client_name',
            'email',
            'phone_number',
            'type_delivery',
            'delivery_address',
            'amount',
            'items_carrito',
            'origen',
        ]
        
        
        read_only_fields = ['order_number', 'status', 'created_at', 'daily_sequence']
        
        
        
    #Metodo para guardar pedido
    def create(self, validated_data):
        
        items_carrito_data = validated_data.pop('items_carrito')
        
        
        pedido = Pedido.objects.create(**validated_data)
        
        #Crear los objetos DetallePedido
        detalles_pedido = []
        for item_data in items_carrito_data:
            
            detalles_pedido.append(
                DetallePedido(order=pedido, **item_data)
            )
            
        DetallePedido.objects.bulk_create(detalles_pedido)
        
        return pedido
    
    
class PedidoEstadoSerializer(serializers.ModelSerializer):
    details = DetallePedidoSerializer(many=True, read_only=True)
        
    class Meta:
        model = Pedido
            
        fields = ['order_number', 'status', 'type_delivery', 'created_at', 'amount', 'details']
            
        


####Serializer para Vista de Administrador y Cocina#######



class DetallePedidoAdminSerializer(serializers.ModelSerializer):
    personalizacion_detalle = serializers.SerializerMethodField()
    
    class Meta:
        model = DetallePedido
        fields = ['product_name', 'quantity', 'personalizacion_json', 'personalizacion_detalle']
        
        
        
    def get_personalizacion_detalle(self, obj):
        if not obj.personalizacion_json:
            return "N/A"
        
        
        nombres = []
        for clase_id, ingredientes in obj.personalizacion_json.items():
            if isinstance(ingredientes, list):
                for ing in ingredientes:
                    nombres.append(ing.get('name', 'Ingrediente Desconocido'))    
        return ", ".join(nombres)
    
    

class PedidoAdminSerializer(serializers.ModelSerializer):
    details = DetallePedidoAdminSerializer(many=True,read_only= True)
    estado_display = serializers.CharField(source= 'get_estado_display', read_only = True)
    
    class Meta:
        model = Pedido
    
        fields = [
            'order_number',
            'client_name',
            'phone_number',
            'type_delivery',
            'delivery_address',
            'status',
            'estado_display',
            'created_at',
            'amount',
            'details'
        ]
        
        
        read_only_fields = [
            'order_number',
            'client_name',
            'phone_number',
            'type_delivery',
            'delivery_address',
            'created_at',
            'amount',
            'origen',
        ]
        #########El admin solo podra cambiar el estado
    
    




class PushSubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PushSubscription
        fields = ['endpoint', 'p256dh', 'auth']




class SesionCajaSerializer(serializers.ModelSerializer):
    class Meta:
        model = SesionCaja
        fields = '__all__'
        read_only_fields = ['usuario_id']