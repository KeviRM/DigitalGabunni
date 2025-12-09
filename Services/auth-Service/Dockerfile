# Usamos una imagen ligera de Python
FROM python:3.11-slim

# Evita que Python genere archivos .pyc y buffer de salida
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Instalar dependencias del sistema (necesarias para Postgres)
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements e instalar
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
# Instalar Gunicorn (servidor de producción) y Psycopg2 (driver DB)
RUN pip install gunicorn psycopg2-binary

# Copiar el resto del código
COPY . .

# Comando por defecto (Gunicorn)
# IMPORTANTE: Cambia 'MicroservicioAuth' por el nombre de la carpeta de tu proyecto en cada caso
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "MicroservicioAuth.wsgi:application"]