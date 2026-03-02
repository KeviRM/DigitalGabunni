"""
URL configuration for MicroservicioPedidos project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from gestion_pedidos.views import AnalyticsView, ReporteVentasCSV, SavePushSubscriptionView, ReporteCortesCSV
from gestion_pedidos.views import MercadoPagoWebhook

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/pedidos/', include('gestion_pedidos.urls')),
    path('api/v1/push/subscribe/', SavePushSubscriptionView.as_view(), name='push_subscribe'),
    path('api/v1/pedidos/analytics/', AnalyticsView.as_view(), name='analytics-data'),
    path('api/v1/pedidos/reportes/ventas/', ReporteVentasCSV.as_view(), name='reporte-ventas'),
    path('api/v1/pedidos/reportes/cortes/', ReporteCortesCSV.as_view(), name='reporte-cortes'),
    path('api/v1/pedidos/webhook/', MercadoPagoWebhook.as_view(), name='mp-webhook'),
]
