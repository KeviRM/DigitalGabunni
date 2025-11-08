from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoriaViewSet,
    ProductoViewSet,
    ClaseIngredienteViewSet,
    ProductoGestionViewSet,
    CategoriaGestionViewSet,
    IngredienteGestionViewSet
)




router = DefaultRouter()
router.register("productos", ProductoViewSet)
router.register("categorias", CategoriaViewSet)
router.register("personalizacion", ClaseIngredienteViewSet)


router_admin = DefaultRouter()
router_admin.register(r'gestion/productos', ProductoGestionViewSet, basename='admin-productos')
router_admin.register(r'gestion/categorias', CategoriaGestionViewSet, basename='admin-categorias')
router_admin.register(r'gestion/ingredientes', IngredienteGestionViewSet, basename='admin-ingredientes')



urlpatterns = [
    path('', include(router.urls)),
    
    path('admin', include(router_admin.urls))
    
]


