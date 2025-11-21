

from rest_framework import serializers
from .models import (
    Category, 
    Producto, 
    ClaseIngrediente, 
    Ingrediente, 
    UnidadMedida, 
    ProductoIngrediente,
    Paquete,
    PaqueteProducto,
    Favorito
    )


#######Serializer para los Ingredientes #########
class IngredienteSerializer(serializers.ModelSerializer):
    unidad_abreviatura = serializers.ReadOnlyField(source='unidad_medida.abbreviation')
    class Meta:
        model = Ingrediente
        fields = ['id', 'name', 'additional_price', '_class', 'created_at', 'unidad_medida', 'unidad_abreviatura']
        read_only_fields = ['id', 'unidad_abreviatura']
 
 
#########Serializer para clase de ingredientes##########  
class ClaseIngredienteSerializer(serializers.ModelSerializer):
    
    ######ingredientes relacionados con la clase########
    ingredientes = IngredienteSerializer(many=True, read_only=True)
    
    class Meta:
        model = ClaseIngrediente
        fields = ['id', 'name', 'created_at', 'ingredientes']
        
        
######Serializer de categorias
class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'created_at']
        
        


        
        
#######Serializer para la unidad de medida


class UnidadMedidaSerializer(serializers.ModelSerializer):
    class Meta:
        model = UnidadMedida
        fields = ['abbreviation', 'name']
        


####### Serializer para la Receta/Detalle

class RecetaSerializer(serializers.ModelSerializer):
    ingrediente_name = serializers.ReadOnlyField(source= 'ingredient.name')
    unidad = serializers.ReadOnlyField(source = 'ingredient.unidad_medida.abbreviation')
    
    class Meta:
        model = ProductoIngrediente
        fields = ['ingrediente_name', 'quantity', 'unidad']
        
        
        
    
        

####Serializer para productos del Menú#####

class ProductoSerializer(serializers.ModelSerializer):
    
    category_name = serializers.ReadOnlyField(source= 'category.name')

    receta = RecetaSerializer(many=True, read_only=True)
    
    class Meta:
        model = Producto
        
        fields = [
            'id',
            'name',
            'description',
            'price',
            'image',
            'category',
            'category_name',
            'is_active',
            'created_at',
            'receta'
        ]
        
        
        
        
        
        
        
        
        
        
        ######################Admin serializer 
        
        
class UnidadMedidaAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = UnidadMedida
        fields = ['id', 'name', 'abbreviation']







class ProductoIngredienteAdminSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.ReadOnlyField(source='product.name')
    ingrediente_nombre = serializers.ReadOnlyField(source='ingredient.name')

    class Meta:
        model = ProductoIngrediente
    
        fields = ['id', 'product', 'ingredient', 'quantity', 'producto_nombre', 'ingrediente_nombre']
        read_only_fields = ['id', 'producto_nombre', 'ingrediente_nombre']
        
        
        
        
        
        
        
        ####################3Paquetesss######33333
        
        
        
        
        
class PaqueteProductoSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')
    
    class Meta:
        model = PaqueteProducto
        fields = ['id', 'product', 'package', 'product_name', 'quantity']
        
        
        
        
####Crud para admin
        
class PaqueteAdminSerializer(serializers.ModelSerializer):
    items = PaqueteProductoSerializer(many=True, read_only=True) 
    
    class Meta:
        model = Paquete
        fields = '__all__'
        
        
####Serializer para datos activos para menu del cliente

class PaquetePublicoSerializer(serializers.ModelSerializer):
    items = PaqueteProductoSerializer(many=True, read_only=True)
    
    class Meta:
        model = Paquete
        fields = ['id', 'name', 'description', 'price', 'image', 'discount', 'items']

        
        
        
        
        
        
        
        
################Favoritos




class FavoritoSerializer(serializers.ModelSerializer):
    producto_detalle = ProductoSerializer(source='producto', read_only=True)
    class Meta:
        model = Favorito
        
        
        
        
        
        