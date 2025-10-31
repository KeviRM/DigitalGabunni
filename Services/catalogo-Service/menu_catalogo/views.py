from django.shortcuts import render


from rest_framework import viewsets
from .models import Category, Producto, Ingrediente, ClaseIngrediente
from .serializers import (
    CategoriaSerializer,
    ProductoSerializer,
    ClaseIngredienteSerializer,
    IngredienteSerializer
)
# Create your views here.

class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.filter(is_active=True).select_related('category')
    serializer_class = ProductoSerializer
    
    
class CategoriaViewSet(viewsets.ModelViewSet):
    queryset= Category.objects.all()
    serializer_class = CategoriaSerializer


class ClaseIngredienteViewSet(viewsets.ModelViewSet):
    queryset = ClaseIngrediente.objects.all().prefetch_related('ingredientes')
    serializer_class = ClaseIngredienteSerializer
    
class IngredienteViewSet(viewsets.ModelViewSet):
    queryset = Ingrediente.objects.select_related('_class')
    serializer_class = ClaseIngredienteSerializer
    
