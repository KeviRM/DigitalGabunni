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
    required = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    single_selection = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.name} ({'Único' if self.single_selection else 'Múltiple'})"




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
    available = models.BooleanField(default=True)
    
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
    



class Paquete(models.Model):
    name = models.CharField(max_length=150)
    description = models.TextField()
    price = models.DecimalField(max_digits=8, decimal_places=2)
    image = models.ImageField(upload_to='paquetes/', blank=True, null=True)
    discount = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    is_active = models.BooleanField(default=True)
    
    
    def __str__(self):
        return f"Paquete: {self.name} ({self.discount}% OFF)"






class PaqueteProducto(models.Model):
 
    package = models.ForeignKey(Paquete, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Producto, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1) # Cantidad de este producto en el paquete
    
    class Meta:
        unique_together = ('package', 'product')
        verbose_name = "Item de Paquete"
        
    def __str__(self):
        return f"{self.quantity}x {self.product.name} en {self.package.name}"






class Favorito(models.Model):
    usuario_id = models.IntegerField(db_index=True) # ID del usuario (Auth)
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    fecha_agregado = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('usuario_id', 'producto') # Evitar duplicados