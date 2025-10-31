from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PedidoCreationViewSet, PedidoEstadoViewSet

router_creacion = DefaultRouter()
router_creacion.register(r'crear', PedidoCreationViewSet, basename='pedido-crear')


router_estado = DefaultRouter()
router_estado.register(r'estado', PedidoEstadoViewSet, basename='pedido-estado')



urlpatterns = [
    path('', include(router_creacion.urls)),
    
    path('', include(router_estado.urls)),
]
