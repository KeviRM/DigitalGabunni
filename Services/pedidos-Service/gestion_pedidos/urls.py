from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PedidoCreationViewSet, PedidoEstadoViewSet, PedidoGestionViewSet

router_creacion = DefaultRouter()
router_creacion.register(r'crear', PedidoCreationViewSet, basename='pedido-crear')


# router_estado = DefaultRouter()
# router_estado.register(r'estado', PedidoEstadoViewSet, basename='pedido-estado')

router_gestion = DefaultRouter()
router_gestion.register(r'gestion', PedidoGestionViewSet, basename='pedido-gestion')




urlpatterns = [
    path('', include(router_creacion.urls)),
    
    path(
        'estado/<uuid:order_number>/', 
        PedidoEstadoViewSet.as_view({'get': 'retrieve'}), 
        name='pedido-estado-detalle'
    ),
    
    path('', include(router_gestion.urls))
]
