from django.urls import path
from .views import InfoTiendaView

urlpatterns = [
    path('info/', InfoTiendaView.as_view(), name='info-tienda'),
]
