from django.shortcuts import render
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.exceptions import PermissionDenied


from rest_framework import viewsets
from .models import (
    Category, 
    Producto, 
    Ingrediente, 
    ClaseIngrediente,
    UnidadMedida,
    ProductoIngrediente,
    PaqueteProducto,
    Paquete,
    Favorito
    )
from .serializers import (
    CategoriaSerializer,
    ProductoSerializer,
    ClaseIngredienteSerializer,
    IngredienteSerializer,
    UnidadMedidaSerializer,
    UnidadMedidaAdminSerializer,
    ProductoIngredienteAdminSerializer,
    PaqueteAdminSerializer,
    PaqueteProductoSerializer,
    PaquetePublicoSerializer,
    FavoritoSerializer
)
# Create your views here.

class ProductoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Producto.objects.filter(is_active=True).select_related('category')
    serializer_class = ProductoSerializer
    permission_classes = [AllowAny]
    
    
class CategoriaViewSet(viewsets.ModelViewSet):
    queryset= Category.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [AllowAny]


class ClaseIngredienteViewSet(viewsets.ModelViewSet):
    queryset = ClaseIngrediente.objects.all().prefetch_related('ingredientes')
    serializer_class = ClaseIngredienteSerializer
    permission_classes = [AllowAny]
    
    
class IngredienteViewSet(viewsets.ModelViewSet):
    queryset = Ingrediente.objects.select_related('_class')
    serializer_class = IngredienteSerializer
    permission_classes = [AllowAny]
    



class UnidadMedidaViewSet(viewsets.ModelViewSet):
    queryset= UnidadMedida.objects.all()
    serializer_class = UnidadMedidaSerializer
    permission_classes = [AllowAny]
    
    
    
#################### ViewSets: CRUDS
    
class ProductoGestionViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.all().select_related('category')
    serializer_class = ProductoSerializer
    permission_classes = [IsAuthenticated]
    
class CategoriaGestionViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [IsAuthenticated]
    
class IngredienteGestionViewSet(viewsets.ModelViewSet):
    queryset = Ingrediente.objects.all().select_related('_class')
    serializer_class = IngredienteSerializer
    permission_classes = [IsAuthenticated]
    
    
class ClaseIngredienteGestionViewSet(viewsets.ModelViewSet):
    queryset = ClaseIngrediente.objects.all().prefetch_related('ingredientes')
    serializer_class = ClaseIngredienteSerializer
    permission_classes = [IsAuthenticated]


class UnidadMedidaGestionViewSet(viewsets.ModelViewSet):
    queryset = UnidadMedida.objects.all().order_by('name')
    serializer_class = UnidadMedidaAdminSerializer
    permission_class = [IsAuthenticated]




class ProductoIngredienteGestionViewSet(viewsets.ModelViewSet):
    queryset = ProductoIngrediente.objects.all().select_related('product', 'ingredient', 'ingredient__unidad_medida')
    serializer_class = ProductoIngredienteAdminSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        product_id = self.request.query_params.get('product_id')
        if product_id:
            queryset = queryset.filter(product_id=product_id)
        return queryset
    
    
    
    
    
### --- ViewSet Público  ---
class PaquetePublicoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Paquete.objects.filter(is_active=True).prefetch_related('items', 'items__product')
    serializer_class = PaquetePublicoSerializer
    permission_classes = [AllowAny]
    
    


##### ViewSet de Gestión (CRUD para Admin) ---
class PaqueteGestionViewSet(viewsets.ModelViewSet):
    queryset = Paquete.objects.all().prefetch_related('items', 'items__product')
    serializer_class = PaqueteAdminSerializer
    permission_classes = [IsAuthenticated]


# --- ViewSet de Gestión de Items  ---
class PaqueteProductoGestionViewSet(viewsets.ModelViewSet):
    queryset = PaqueteProducto.objects.all().select_related('package', 'product')
    serializer_class = PaqueteProductoSerializer
    permission_classes = [IsAuthenticated]




class FavoritoViewSet(viewsets.ModelViewSet):
    serializer_class = FavoritoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Favorito.objects.filter(usuario_id=self.request.user.id)

    def perform_create(self, serializer):
        # CRÍTICO: El usuario debe venir del request, NO del body del frontend
        if self.request.user.is_authenticated:
            # Imprimir para depurar
            print(f"Creando favorito para usuario ID: {self.request.user.id}")
            try:
                serializer.save(usuario_id=self.request.user.id)
            except Exception as e:
                print(f"Error al guardar favorito: {e}")
                raise e
        else:
            # Si llega aquí, el token no se validó correctamente antes
            raise PermissionDenied("No estás autenticado correctamente.")

    