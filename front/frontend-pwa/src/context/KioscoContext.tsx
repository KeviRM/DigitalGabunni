import React, { createContext, useState, useContext, ReactNode, useMemo } from 'react';

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
    modificarCantidad: (idUnico: number, nuevaCantidad: number) => void;
    limpiarCarrito: () => void;
    total: number;
    cantidadItems: number;
}

const KioscoContext = createContext<KioscoContextType | undefined>(undefined);

export const KioscoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<ItemKiosco[]>([]);

    const parsePrecio = (valor: any): number => {
        if (typeof valor === 'number') return valor;
        if (typeof valor === 'string') {
            return parseFloat(valor.replace('$', '').replace(/,/g, '')) || 0;
        }
        return 0;
    };

    const agregarAlCarrito = (producto: any, esPaquete: boolean = false) => {
        const precioRaw = producto.price !== undefined ? producto.price : (producto.precio !== undefined ? producto.precio : 0);
        const precioFinal = parsePrecio(precioRaw);

        const nuevoItem: ItemKiosco = {
            idUnico: Date.now() + Math.random(),
            producto: producto,
            cantidad: 1,
            precio: precioFinal,
            esPaquete
        };

        setItems(prev => {
            const nuevoEstado = [...prev, nuevoItem];
            return nuevoEstado;
        });
    };

    const eliminarDelCarrito = (idUnico: number) => {
        setItems(prev => prev.filter(item => item.idUnico !== idUnico));
    };

    const modificarCantidad = (idUnico: number, nuevaCantidad: number) => {
        if (nuevaCantidad <= 0) {
            eliminarDelCarrito(idUnico);
            return;
        }
        setItems(prev => prev.map(item =>
            item.idUnico === idUnico ? { ...item, cantidad: nuevaCantidad } : item
        ));
    };

    const limpiarCarrito = () => {
        setItems([]);
    };

    // Cálculos optimizados
    const total = useMemo(() => {
        return items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    }, [items]);

    const cantidadItems = items.length;

    const value = useMemo(() => ({
        items,
        agregarAlCarrito,
        eliminarDelCarrito,
        modificarCantidad,
        limpiarCarrito,
        total,
        cantidadItems
    }), [items, total, cantidadItems]);

    return (
        <KioscoContext.Provider value={value}>
            {children}
        </KioscoContext.Provider>
    );
};

export const useKiosco = () => {
    const context = useContext(KioscoContext);
    if (!context) throw new Error("useKiosco debe usarse dentro de KioscoProvider (Revisa KioscoLayout)");
    return context;
};