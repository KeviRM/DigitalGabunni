import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer


class PedidosConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'grupo_{self.room_name}'
        
        # Unirse al grupo
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()
        
        
        
    async def disconnect(self, close_code):
        # Salir del grupo
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        
        
        # Recibir mensaje del grupo (evento enviado desde la Vista)
    async def pedido_update(self, event):
        pedido = event['pedido']

        # Enviar mensaje al WebSocket (al Frontend)
        await self.send(text_data=json.dumps({
            'type': 'actualizacion_pedido',
            'pedido': pedido
        }))
        
        
        
        