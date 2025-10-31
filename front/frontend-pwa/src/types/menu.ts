export interface Categoria {
    id: number;
    name: string;
}



export interface Producto {
    id: number;
    name: string;
    description: string;
    price: string; //string para el DecimalField de Django
    image: string|null;
    category: number; // numerico por que es el id de la categoria
    category_name: string;
    is_active: boolean;
}



export interface Ingrediente {
    id: number;
    name: string;
    aditional_price: string;
}

export interface ClaseIngrediente {
    id: number;
    name: string;
    required: boolean;
    ingredientes: Ingrediente[];
}






//item de carrito 

export interface ItemCarrito
{

    idUnico: string;
    productoBase: Producto;
    cantidad: number;
    precioUnitario:number;

    //Detalle de personalizacion 

    personalizacion?: {
        [claseId: number]: Ingrediente[];
    };


}




//Provee el context del carrito

export interface CarritoContextType {
    items: ItemCarrito[];
    totalPrecio: number;
    agregarItem: (item: Omit<ItemCarrito, 'idUnico' | 'cantidad'>) => void;

    eliminarItem: (idUnico: string) => void;

    actualizarCantidad:(idUnico: string, nuevaCantidad: number) => void;

    limpiarCarrito: () => void;

}


