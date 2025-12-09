
import axios from 'axios';

// 1. Instancia para Autenticación (Usuarios, Tokens)
export const authApi = axios.create({
    baseURL: import.meta.env.VITE_AUTH_URL, 
    withCredentials: true // Importante para cookies si las usas
});

// 2. Instancia para el Catálogo (Productos)
export const catalogoApi = axios.create({
    baseURL: import.meta.env.VITE_CATALOGO_URL,
});

// 3. Instancia para Pedidos
export const pedidosApi = axios.create({
    baseURL: import.meta.env.VITE_PEDIDOS_URL,
});

// 4. Instancia para Contenido (CMS)
export const contenidoApi = axios.create({
    baseURL: import.meta.env.VITE_CONTENIDO_URL,
});