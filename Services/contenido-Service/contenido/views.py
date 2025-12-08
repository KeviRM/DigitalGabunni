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

from .models import MensajeContacto
from .serializers import MensajeContactoSerializer

class CrearMensajeView(APIView):
    def post(self, request):
        serializer = MensajeContactoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ListarMensajesView(APIView):
    def get(self, request):
        mensajes = MensajeContacto.objects.all()
        serializer = MensajeContactoSerializer(mensajes, many=True)
        return Response(serializer.data)

class MensajeDetalleView(APIView):
    def get_object(self, pk):
        try:
            return MensajeContacto.objects.get(pk=pk)
        except MensajeContacto.DoesNotExist:
            return None

    def patch(self, request, pk):
        mensaje = self.get_object(pk)
        if not mensaje:
            return Response(status=status.HTTP_404_NOT_FOUND)
        
        serializer = MensajeContactoSerializer(mensaje, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        mensaje = self.get_object(pk)
        if not mensaje:
            return Response(status=status.HTTP_404_NOT_FOUND)
        mensaje.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
