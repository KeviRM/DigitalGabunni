from django.db import models
import uuid

# Create your models here.


STATUS_CHOISE =[
    ('CONFIRMADO', 'confirmado'),
    ('PREPARACION', 'En Preparación'),    
    ('LISTO', 'Listo para Recoger/Enviar'),
    ('ENTREGADO', 'Entregado'),
    ('CANCELADO', 'Cancelado'),
]


class Pedido(models.Model):
    order_number = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    
    
    client_name = models.CharField(max_length=100)
    email = models.EmailField(blank=True, null=True)
    phone_number = models.CharField(max_length=20)
    
    TYPE_DELIVERY_CHOICES = [
        ('RECOGER', 'Recoger en el Local'),
        ('DOMICILIO', 'A Domicilio'),
    ]
    
    
    type_delivery = models.CharField(max_length=10, choices=TYPE_DELIVERY_CHOICES)
    
    delivery_address = models.TextField(blank=True, null=True)
    
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOISE,
        default='CONFIRMADO'
    )
    
    
    created_at = models.DateTimeField(auto_now_add=True)
    amount = models.DecimalField(max_digits=8, decimal_places=2)
    
    
    class Meta:
        ordering = ['-created_at']
        
        
    def __str__(self):
        return f"Pedido #{self.order_number} - {self.get_estado_display()}"
    
    
    
class DetallePedido(models.Model):
    
    
    order = models.ForeignKey(Pedido, on_delete=models.CASCADE, related_name='detalles')
    
    
    product_name = models.CharField(max_length=200)
    quantity = models.IntegerField(default=1)
    unit_price = models.DecimalField(max_digits=8, decimal_places=2)
    
    
    personalizacion_json = models.JSONField(blank=True, null=True)
    
    
    def __str__(self):
        return f"{self.quantity}x {self.product_name} en Pedido {self.order.order_number}"
    
    

