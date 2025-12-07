from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import InformacionTienda
from .serializers import InformacionTiendaSerializer

class InfoTiendaView(APIView):
    def get(self, request):
        info, created = InformacionTienda.objects.get_or_create(pk=1)
        serializer = InformacionTiendaSerializer(info)
        return Response(serializer.data)

    def put(self, request):
        info, created = InformacionTienda.objects.get_or_create(pk=1)
        serializer = InformacionTiendaSerializer(info, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request):
        info, created = InformacionTienda.objects.get_or_create(pk=1)
        serializer = InformacionTiendaSerializer(info, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
