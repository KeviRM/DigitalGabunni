from django.shortcuts import render
from rest_framework.permissions import AllowAny

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
    
    
    
class ProductoGestionViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.all().select_related('category')
    serializer_class = ProductoSerializer
    permission_classes = [AllowAny]
    
class CategoriaGestionViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [AllowAny]
    
class IngredienteGestionViewSet(viewsets.ModelViewSet):
    queryset = Ingrediente.objects.all().select_related('_class')
    serializer_class = IngredienteSerializer
    permission_classes = [AllowAny]
    
    
