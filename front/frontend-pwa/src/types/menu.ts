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
    receta: RecetaItem[];
     
}



export interface Ingrediente {
    id: number;
    name: string;
    additional_price: string;
    unidad_abreviatura?: string;
    available: boolean;

}

export interface ClaseIngrediente {
    id: number;
    name: string;
    required: boolean;
    ingredientes: Ingrediente[];
    single_selection: boolean;

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


    contenidoPaquete?: {
        product_name: string;
        quantity: number;
    }[];


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



export interface RecetaItem {
    id?: number; // Opcional para nuevos ítems
    product: number; // ID del producto
    ingredient: number; // ID del ingrediente
    quantity: string;
    
    // Campos de solo lectura para la vista:
    producto_nombre?: string;
    ingrediente_nombre?: string;
    
}




export interface PaqueteItemPublico {
    id: number;
    product: number;
    product_name: string;
    quantity: number;
}

export interface Paquete {
    id: number;
    name: string;
    description: string;
    price: string;
    image: string | null;
    discount: string;
    items: PaqueteItemPublico[];
}