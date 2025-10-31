from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoriaViewSet,ProductoViewSet,ClaseIngredienteViewSet




router = DefaultRouter()
router.register("productos", ProductoViewSet)
router.register("categorias", CategoriaViewSet)
router.register("personalizacion", ClaseIngredienteViewSet)




urlpatterns = [
    path('', include(router.urls)),
    
]


