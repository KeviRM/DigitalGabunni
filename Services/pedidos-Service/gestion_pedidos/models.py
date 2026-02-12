from django.db import models
import uuid

# Create your models here.




class Pedido(models.Model):
    order_number = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    
    STATUS_CHOISE =[
        ('PENDIENTE', 'pendiente de pago'),
        ('ESPERANDO_PAGO', 'Esperando Pago En Caja'),
        ('CONFIRMADO', 'confirmado'),
        ('PREPARACION', 'En Preparación'),    
        ('LISTO', 'Listo para Recoger/Enviar'),
        ('ENTREGADO', 'Entregado'),
        ('CANCELADO', 'Cancelado'),
        
    ]



    ORIGEN_CHOISE =[
        ('APP', 'Aplicacion Movil'),
        ('KIOSCO', 'Kiosco Digital'),
        ('CAJA', 'En Caja del Local'),
    ]

    
    usuario_id = models.IntegerField(null=True, blank=True, db_index=True)
    
    client_name = models.CharField(max_length=100)
    email = models.EmailField(blank=True, null=True)
    phone_number = models.CharField(max_length=20)
    
    TYPE_DELIVERY_CHOICES = [
        ('RECOGER', 'Recoger en el Local'),
        ('DOMICILIO', 'A Domicilio'),
        ('LLEVAR', 'Llevar a Otro Lugar'),
        ('COMER_AQUI', 'Comer en el Local')
    ]
    
    
    type_delivery = models.CharField(max_length=20, choices=TYPE_DELIVERY_CHOICES, default='RECOGER')
    
    
    delivery_address = models.TextField(blank=True, null=True)
    
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOISE,
        default='PENDIENTE'
    )

    origen = models.CharField(
        max_length=10,
        choices=ORIGEN_CHOISE,
        default='APP'
    )
    
    
    created_at = models.DateTimeField(auto_now_add=True)
    amount = models.DecimalField(max_digits=8, decimal_places=2)



    sesion_caja = models.ForeignKey('SesionCaja', on_delete=models.SET_NULL, null=True, blank=True, related_name='pedidos')

    METODO_PAGO_CHOICES = [
        ('EFECTIVO', 'Efectivo'),  
        ('TARJETA', 'Tarjeta de Crédito/Débito'),  
        ('MIXTO', 'Pago Mixto'),
        ('ONLINE', 'Pago Online'),  
    ]  

    metodo_pago = models.CharField(max_length=20, choices=METODO_PAGO_CHOICES, blank=True, null=True)

    monto_recibido = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    cambio_entregado = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)

    
    
    class Meta:
        ordering = ['-created_at']
        
        
    def __str__(self):
        return f"Pedido #{self.order_number} - {self.get_estado_display()}"
    
    
    
class DetallePedido(models.Model):
    
    
    order = models.ForeignKey(Pedido, on_delete=models.CASCADE, related_name='details')
    
    
    product_name = models.CharField(max_length=200)
    quantity = models.IntegerField(default=1)
    unit_price = models.DecimalField(max_digits=8, decimal_places=2)
    
    
    personalizacion_json = models.JSONField(blank=True, null=True)
    
    
    def __str__(self):
        return f"{self.quantity}x {self.product_name} en Pedido {self.order.order_number}"
    
    






class PushSubscription(models.Model):
    usuario_id = models.IntegerField() # ID del usuario (del token)
    endpoint = models.URLField(max_length=500)
    p256dh = models.CharField(max_length=255)
    auth = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Subscripcion User {self.usuario_id}"




class SesionCaja(models.Model):
    ESTADOS = [
        ('ABIERTA', 'Abierta'),
        ('CERRADA', 'Cerrada'),
    ]


    usuario_id = models.IntegerField(db_index=True)
    fecha_inicio = models.DateTimeField(auto_now_add=True)
    fondo_inicial = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    fecha_cierre = models.DateTimeField(null=True, blank=True)
    estado = models.CharField(max_length=10, choices=ESTADOS, default='ABIERTA')

    total_sistema_efectivo = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_sistema_tarjeta = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    total_real_efectivo = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_real_tarjeta = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    diferencia_efectivo = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    diferencia_tarjeta = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    observaciones = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Caja{self.id} - Usuario {self.usuario_id} - ({self.estado})"
    