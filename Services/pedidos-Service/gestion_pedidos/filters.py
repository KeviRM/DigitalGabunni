import django_filters
from django_filters import DateFromToRangeFilter
from .models import Pedido
from django.db.models import Q



class PedidoFilter(django_filters.FilterSet):
    #  Filtro por Rango de Fechas 
    fecha_rango = DateFromToRangeFilter(field_name='created_at')
    
    #  Filtro por Estado 
    status = django_filters.MultipleChoiceFilter(choices=Pedido.STATUS_CHOISE)
    
    #  Filtro de Búsqueda 
    busqueda = django_filters.CharFilter(method='filter_busqueda', label='Búsqueda por Cliente o UUID')
    
    class Meta:
        model = Pedido
        fields = ['status', 'fecha_rango', 'busqueda']

    # Método personalizado para la búsqueda combinada 
    def filter_busqueda(self, queryset, name, value):
        if value:
            return queryset.filter(
                Q(order_number__icontains=value) |  # Busca en el UUID
                Q(client_name__icontains=value)   # Busca en el nombre del cliente
            )
        return queryset