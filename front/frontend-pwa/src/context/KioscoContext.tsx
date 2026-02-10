import React, { createContext, useState, useContext, ReactNode } from 'react';

// Tipos definidos
interface ItemKiosco {
    idUnico: number;
    producto: any;   
    cantidad: number;
    precio: number; // Siempre será número
    esPaquete: boolean;
}

interface KioscoContextType {
    items: ItemKiosco[];
    agregarAlCarrito: (producto: any, esPaquete?: boolean) => void;
    eliminarDelCarrito: (idUnico: number) => void;
    limpiarCarrito: () => void;
    total: number;
    cantidadItems: number;
}

const KioscoContext = createContext<KioscoContextType | undefined>(undefined);

export const KioscoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<ItemKiosco[]>([]);

    const agregarAlCarrito = (producto: any, esPaquete: boolean = false) => {
        console.log(" Intentando agregar:", producto);

        
        let precioRaw = producto.price || producto.precio || 0;
        if (typeof precioRaw === 'string') {
            precioRaw = precioRaw.replace('$', '').replace(',', '');
        }
        const precioFinal = parseFloat(precioRaw) || 0;
        

        const nuevoItem: ItemKiosco = {
            idUnico: Date.now() + Math.random(),
            producto: producto,
            cantidad: 1,
            precio: precioFinal,
            esPaquete
        };
        
        // Usamos una actualización funcional para asegurar que React detecte el cambio
        setItems(prev => {
            const nuevoEstado = [...prev, nuevoItem];
            console.log(" Carrito actualizado. Items:", nuevoEstado.length);
            return nuevoEstado;
        });
    };

    const eliminarDelCarrito = (idUnico: number) => {
        setItems(prev => prev.filter(item => item.idUnico !== idUnico));
    };

    const limpiarCarrito = () => {
        setItems([]);
    };

    // Cálculos automáticos en cada render
    const total = items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    const cantidadItems = items.length;

    return (
        <KioscoContext.Provider value={{ items, agregarAlCarrito, eliminarDelCarrito, limpiarCarrito, total, cantidadItems }}>
            {children}
        </KioscoContext.Provider>
    );
};

export const useKiosco = () => {
    const context = useContext(KioscoContext);
    if (!context) throw new Error("useKiosco debe usarse dentro de KioscoProvider (Revisa KioscoLayout)");
    return context;
};