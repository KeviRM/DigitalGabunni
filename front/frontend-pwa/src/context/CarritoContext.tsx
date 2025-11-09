import React, {createContext, useState, useContext, useMemo} from "react";
import type{ ItemCarrito, CarritoContextType, Producto, Ingrediente } from "../types/menu";
import { v4 as uuidv4 } from 'uuid'; // generador de id's unicos




//contexto

const CarritoContext = createContext<CarritoContextType | undefined>(undefined);

//hook para usar el context

export const useCarrito = () => {
    const context = useContext(CarritoContext);
    if (context === undefined) {
        throw new Error('useCarrito debe usarse dentro de un CarritoProvider');

    }
    return context;
};



// el Provider del Carrito

export const CarritoProvider: React.FC< {children: React.ReactNode}> = ({ children }) =>{
    const [items, setItems] = useState<ItemCarrito[]>([]);


    //Calcular el precio de un item

    const calcularPrecioUnitario = (productoBase: Producto, personalizacion?: {[claseId: number]: Ingrediente[] }): number => {
        let precio = parseFloat(productoBase.price);

        if(personalizacion){
            Object.values(personalizacion).forEach(ingredientes => {
                ingredientes.forEach(ing =>{
                    precio += parseFloat(ing.additional_price);
                });
            });
        }
        return precio;
    };



    // Agregar nuevo itenm al carrito

    const agregarItem = (itemData: Omit<ItemCarrito, 'idUnico' | 'cantidad'>) =>{
        const nuevoItem: ItemCarrito ={
            ...itemData,
            idUnico: uuidv4(), // Generar un id unico 
            cantidad: 1, 
            precioUnitario: calcularPrecioUnitario(itemData.productoBase, itemData.personalizacion),

        };
        setItems(prevItems => [...prevItems, nuevoItem]);
    };


    //Eliminar item

    const eliminarItem = (idUnico: string) => {
        setItems(prevItems => prevItems.filter(item => item.idUnico !== idUnico));

    };


    //Actualizar Item

    const actualizarCantidad = (idUnico: string, nuevaCantidad: number) =>{
        if (nuevaCantidad <= 0) {
            eliminarItem(idUnico);
            return;
        }

        setItems (prevItems =>
            prevItems.map(item =>
                item.idUnico === idUnico ? { ...item, cantidad: nuevaCantidad } : item
            )
        );
    };


    //vaciar el carrito

    const limpiarCarrito = () => {
        setItems([]);
    };


    //Calculo del precio total

    const totalPrecio = useMemo(() =>{
        return items.reduce((total, item) => total + (item.precioUnitario * item.cantidad), 0);
    }, [items]);

    const contextValue: CarritoContextType = {
        items,
        totalPrecio,
        agregarItem,
        eliminarItem,
        actualizarCantidad,
        limpiarCarrito,
    };



    return (
        <CarritoContext.Provider value={contextValue}>
            {children}
        </CarritoContext.Provider>
    );



};