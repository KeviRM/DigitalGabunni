from django.shortcuts import render
from rest_framework.permissions import AllowAny, IsAuthenticated

from rest_framework import viewsets
from .models import (
    Category, 
    Producto, 
    Ingrediente, 
    ClaseIngrediente,
    UnidadMedida,
    ProductoIngrediente
    )
from .serializers import (
    CategoriaSerializer,
    ProductoSerializer,
    ClaseIngredienteSerializer,
    IngredienteSerializer,
    UnidadMedidaSerializer,
    UnidadMedidaAdminSerializer,
    ProductoIngredienteAdminSerializer
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
    serializer_class = IngredienteSerializer



class UnidadMedidaViewSet(viewsets.ModelViewSet):
    queryset= UnidadMedida.objects.all()
    serializer_class = UnidadMedidaSerializer
    
    
#################### ViewSets: CRUDS
    
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
    


class UnidadMedidaGestionViewSet(viewsets.ModelViewSet):
    queryset = UnidadMedida.objects.all().order_by('name')
    serializer_class = UnidadMedidaAdminSerializer
    permission_class = [AllowAny]




class ProductoIngredienteGestionViewSet(viewsets.ModelViewSet):
    queryset = ProductoIngrediente.objects.all().select_related('product', 'ingredient', 'ingredient__unidad_medida')
    serializer_class = ProductoIngredienteAdminSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        product_id = self.request.query_params.get('product_id')
        if product_id:
            queryset = queryset.filter(product_id=product_id)
        return queryset
    