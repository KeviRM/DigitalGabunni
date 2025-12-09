FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
# Instalamos daphne (para ASGI/Websockets) y psycopg2
RUN pip install daphne psycopg2-binary

COPY . .

# Usamos DAPHNE en lugar de Gunicorn
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "MicroservicioPedidos.asgi:application"]