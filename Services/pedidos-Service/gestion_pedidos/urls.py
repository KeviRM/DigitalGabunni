from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (PedidoCreationViewSet,
                    PedidoEstadoViewSet,
                    PedidoGestionViewSet,
                    MisPedidosViewSet
                    )

from .views import CreatePaymentPreference




router_creacion = DefaultRouter()
router_creacion.register(r'crear', PedidoCreationViewSet, basename='pedido-crear')


# router_estado = DefaultRouter()
# router_estado.register(r'estado', PedidoEstadoViewSet, basename='pedido-estado')

router_gestion = DefaultRouter()
router_gestion.register(r'gestion', PedidoGestionViewSet, basename='pedido-gestion')


router_mispedidos = DefaultRouter()
router_mispedidos.register(r'mis-pedidos', MisPedidosViewSet, basename='mis-pedidos')



urlpatterns = [
    path('', include(router_creacion.urls)),
    
    path(
        'estado/<uuid:order_number>/', 
        PedidoEstadoViewSet.as_view({'get': 'retrieve'}), 
        name='pedido-estado-detalle'
    ),
    
    path('', include(router_mispedidos.urls)),
    
    path('', include(router_gestion.urls)),
    
    path('crear-pago/', CreatePaymentPreference.as_view(), name='crear_pago'),
]
