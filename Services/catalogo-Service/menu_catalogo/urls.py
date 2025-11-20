from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoriaViewSet,
    ProductoViewSet,
    ClaseIngredienteViewSet,
    IngredienteViewSet,
    UnidadMedidaViewSet,
    ProductoGestionViewSet,
    CategoriaGestionViewSet,
    IngredienteGestionViewSet,
    UnidadMedidaGestionViewSet,
    ProductoIngredienteGestionViewSet,
    ClaseIngredienteGestionViewSet,
    PaquetePublicoViewSet,
    PaqueteGestionViewSet,
    PaqueteProductoGestionViewSet
)




router = DefaultRouter()
router.register("productos", ProductoViewSet)
router.register("categorias", CategoriaViewSet)
router.register("personalizacion", ClaseIngredienteViewSet)
router.register("ingredientes", IngredienteViewSet)
router.register("unidades", UnidadMedidaViewSet)
router.register(r'paquetes', PaquetePublicoViewSet)


router_admin = DefaultRouter()
router_admin.register(r'gestion/productos', ProductoGestionViewSet, basename='admin-productos')
router_admin.register(r'gestion/categorias', CategoriaGestionViewSet, basename='admin-categorias')
router_admin.register(r'gestion/ingredientes', IngredienteGestionViewSet, basename='admin-ingredientes')
router_admin.register(r'gestion/personalizacion', ClaseIngredienteGestionViewSet, basename='admin-personalizacion')
router_admin.register(r'gestion/unidades', UnidadMedidaGestionViewSet, basename='admin-unidades')
router_admin.register(r'gestion/recetas', ProductoIngredienteGestionViewSet, basename='admin-recetas')
router_admin.register(r'gestion/paquetes', PaqueteGestionViewSet, basename='admin-paquetes')
router_admin.register(r'gestion/paquete-items', PaqueteProductoGestionViewSet, basename='admin-paquete-items')


urlpatterns = [
    path('', include(router.urls)),
    
    path('admin/', include(router_admin.urls))
    
]


