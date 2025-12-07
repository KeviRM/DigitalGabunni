from django.db import models

class InformacionTienda(models.Model):
    direccion = models.TextField(default="Dirección no configurada")
    telefono_principal = models.CharField(max_length=20, default="+00 0000 0000")
    telefono_secundario = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(default="contacto@tienda.com")
    facebook_url = models.URLField(blank=True, null=True)
    instagram_url = models.URLField(blank=True, null=True)
    tiktok_url = models.URLField(blank=True, null=True)
    horario_atencion = models.TextField(default="Lunes a Viernes: 9am - 6pm")
    mensaje_footer = models.TextField(default="Gracias por visitarnos.")

    class Meta:
        verbose_name = "Información de la Tienda"
        verbose_name_plural = "Información de la Tienda"

    def __str__(self):
        return "Información General"

    def save(self, *args, **kwargs):
        # Ensure only one instance exists (optional singleton pattern check)
        if not self.pk and InformacionTienda.objects.exists():
            # If you want to enforce singleton, you can prevent creation or update the existing one.
            # For simplicity, we just allow creation but we will typically just fetch .first()
            pass
        super(InformacionTienda, self).save(*args, **kwargs)
