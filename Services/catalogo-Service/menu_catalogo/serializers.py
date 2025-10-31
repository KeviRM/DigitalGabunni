

from rest_framework import serializers
from .models import Category, Producto, ClaseIngrediente, Ingrediente


#######Serializer para los Ingredientes #########
class IngredienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingrediente
        fields = ['id', 'name', 'additonal_price', 'created_at']
 
 
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
        
        



####Serializer para productos del Menú#####

class ProductoSerializer(serializers.ModelSerializer):
    
    category_name = serializers.ReadOnlyField(source= 'category.name')

    class Meta:
        model = Producto
        
        fields = [
            'id',
            'name',
            'description',
            'price',
            'category',
            'category_name',
            'is_active',
            'created_at'
        ]
        
         
        