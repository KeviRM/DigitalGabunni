from rest_framework import serializers
from .models import Pedido, DetallePedido


class DetallePedidoSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetallePedido
        fields = ['product_name', 'quantity', 'unit_price', 'personalizacion_json' ]
        


class PedidoCreationSerializer(serializers.ModelSerializer):
    
    item_carrito = DetallePedidoSerializer(many= True, write_only=True)
    
    
    class Meta:
        model = Pedido
        
        fields = [
            'client_name',
            'email',
            'phone_number',
            'type_delivery',
            'delivery_address',
            'amount',
            'item_carrito'
        ]
        
        
        read_only_fields = ['order_number', 'status', 'created_at']
        
        
        
    #Metodo para guardar pedido
    def create(self, validated_data):
        
        items_carrito_data = validated_data
        
        
        pedido = Pedido.objects.create(**validated_data)
        
        #Crear los objetos DetallePedido
        detalles_pedido = []
        for item_data in items_carrito_data:
            
            detalles_pedido.append(
                DetallePedido(pedido=pedido, **item_data)
            )
            
        DetallePedido.objects.bulk_create(detalles_pedido)
        
        return pedido
    
    
class PedidoEstadoSerializer(serializers.ModelSerializer):
    detalles = DetallePedidoSerializer(many=True, read_only=True)
        
    class Meta:
        model = Pedido
            
        fields = ['numero_pedido', 'estado', 'tipo_entrega', 'fecha_creacion', 'total_monto', 'detalles']
            
            