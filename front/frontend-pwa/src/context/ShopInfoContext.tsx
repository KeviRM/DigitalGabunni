import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getShopInfo, type ShopInfo } from '../services/contenidoService';

interface ShopInfoContextType {
    info: ShopInfo;
    loading: boolean;
    refreshInfo: () => Promise<void>;
}

const defaultInfo: ShopInfo = {
    direccion: "Cargando...",
    telefono_principal: "...",
    email: "...",
    horario_atencion: "...",
    mensaje_footer: "..."
};

const ShopInfoContext = createContext<ShopInfoContextType>({
    info: defaultInfo,
    loading: true,
    refreshInfo: async () => { }
});

export const useShopInfo = () => useContext(ShopInfoContext);

export const ShopInfoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [info, setInfo] = useState<ShopInfo>(defaultInfo);
    const [loading, setLoading] = useState(true);

    const fetchInfo = async () => {
        setLoading(true);
        const data = await getShopInfo();
        // If data is empty (api fail), keep default or set empty? 
        // Let's assume data comes back with defaults from backend if success.
        if (data && Object.keys(data).length > 0) {
            setInfo(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchInfo();
    }, []);

    return (
        <ShopInfoContext.Provider value={{ info, loading, refreshInfo: fetchInfo }}>
            {children}
        </ShopInfoContext.Provider>
    );
};
