from django.urls import path
from .views import InfoTiendaView, CrearMensajeView, ListarMensajesView, MensajeDetalleView

urlpatterns = [
    path('info/', InfoTiendaView.as_view(), name='info-tienda'),
    path('contacto/enviar/', CrearMensajeView.as_view(), name='enviar-mensaje'),
    path('contacto/mensajes/', ListarMensajesView.as_view(), name='listar-mensajes'),
    path('contacto/mensajes/<int:pk>/', MensajeDetalleView.as_view(), name='detalle-mensaje'),
]
