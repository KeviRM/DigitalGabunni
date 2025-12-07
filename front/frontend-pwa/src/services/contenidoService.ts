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
