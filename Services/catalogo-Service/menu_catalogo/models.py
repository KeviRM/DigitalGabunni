from django.db import models

# Create your models here.


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name
    
    
class Producto(models.Model):
    
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=6, decimal_places=2)
    
    image = models.ImageField(upload_to='productos/', blank=True, null=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='productos')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['category', 'name']
        verbose_name_plural = "Productos"
        
    def __str__(self):
        return f"{self.name}({self.category.name})"
    
    
class ClaseIngrediente(models.Model):
    name = models.CharField(max_length=100, unique=True)
    required = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name




class UnidadMedida(models.Model):
    name = models.CharField(max_length=50, unique=True )
    abbreviation = models.CharField(max_length=10, unique= True)
    
    def __str__(self):
        return self.abbreviation
    
    
    
    
class Ingrediente(models.Model):
    name = models.CharField(max_length=100)
    _class = models.ForeignKey(ClaseIngrediente, on_delete=models.CASCADE, related_name='ingredientes')
    additional_price = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)
    
    
    unidad_medida = models.ForeignKey(UnidadMedida, on_delete=models.SET_NULL, null=True, blank=True)
    
    
    class Meta:
        unique_together = ('name', '_class')
    
    def __str__(self):
        return f"{self.name} ({self._class.name})"
    
    
    
    
class ProductoIngrediente(models.Model):
    product = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name='receta')
    ingredient = models.ForeignKey(Ingrediente, on_delete= models.CASCADE)
    quantity = models.DecimalField(max_digits=6, decimal_places=2, default=1)
    
    
    class Meta:
        unique_together = ('product', 'ingredient')
        verbose_name = "Ingrediente de Receta"
        
    
    def __str__(self):
        return f"{self.product.name} usa {self.ingredient.name}"
    
    