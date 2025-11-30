from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    # Ruta: ws://127.0.0.1:8001/ws/pedidos/cocina/
re_path(r'ws/pedidos/(?P<room_name>[^/]+)/$', consumers.PedidosConsumer.as_asgi())]