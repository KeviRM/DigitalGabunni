import axios from 'axios';

// Assuming local development port for the new service, adjust as needed.
// Ideally this comes from env vars.
const API_URL = 'http://127.0.0.1:8004/api/contenido/info/';

export interface ShopInfo {
    direccion?: string;
    telefono_principal?: string;
    telefono_secundario?: string;
    email?: string;
    facebook_url?: string;
    instagram_url?: string;
    tiktok_url?: string;
    horario_atencion?: string;
    mensaje_footer?: string;
}

export const getShopInfo = async (): Promise<ShopInfo> => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error("Error fetching shop info:", error);
        return {};
    }
};

export const updateShopInfo = async (data: ShopInfo): Promise<ShopInfo> => {
    try {
        const response = await axios.put(API_URL, data); // Or PATCH
        return response.data;
    } catch (error) {
        console.error("Error updating shop info:", error);
        throw error;
    }
};


export interface MensajeContacto {
    id?: number;
    nombre: string;
    numero?: string;
    email: string;
    mensaje: string;
    fecha_creacion?: string;
    leido?: boolean;
}

const MESSAGE_API_URL = 'http://127.0.0.1:8004/api/contenido/contacto/';

export const sendContactMessage = async (data: MensajeContacto): Promise<MensajeContacto> => {
    try {
        const response = await axios.post(`${MESSAGE_API_URL}enviar/`, data);
        return response.data;
    } catch (error) {
        console.error("Error sending message:", error);
        throw error;
    }
};

export const getContactMessages = async (): Promise<MensajeContacto[]> => {
    try {
        const response = await axios.get(`${MESSAGE_API_URL}mensajes/`);
        return response.data;
    } catch (error) {
        console.error("Error fetching messages:", error);
        return [];
    }
};

export const markMessageAsRead = async (id: number, leido: boolean): Promise<MensajeContacto> => {
    try {
        const response = await axios.patch(`${MESSAGE_API_URL}mensajes/${id}/`, { leido });
        return response.data;
    } catch (error) {
        console.error("Error marking message as read:", error);
        throw error;
    }
};
