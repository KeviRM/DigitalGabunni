# ETAPA 1: Construcción (Build)
FROM node:18-alpine as build-stage

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
# Compila el proyecto a la carpeta /app/dist
RUN npm run build

# ETAPA 2: Servidor Web (Producción)
FROM nginx:alpine as production-stage

# Copiamos los archivos compilados de la etapa anterior a la carpeta de Nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copiamos una configuración básica de Nginx (La crearemos en el siguiente paso)
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]