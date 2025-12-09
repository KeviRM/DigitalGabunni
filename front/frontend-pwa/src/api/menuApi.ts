
import type { Producto, Categoria, ClaseIngrediente, Paquete} from "../types/menu";
import {catalogoApi} from '../api/axiosConfig';

const BASE_URL = '/api/v1/catalogo/';

export const fetchProductos = async(): Promise<Producto[]> => {
    try{
        const response = await catalogoApi.get<Producto[]>(`${BASE_URL}productos/`);
        return response.data;
    } catch(error){
        console.error('error al obtener los productos', error);
        return[];
    }
};

export const fetchPaquetes = async (): Promise<Paquete[]> => {
  try {
    const response = await catalogoApi.get<Paquete[]>(`${BASE_URL}paquetes/`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener paquetes:", error);
    return [];
  }
};



export const fetchCategorias = async(): Promise<Categoria[]> =>{

    try{
        const response = await catalogoApi.get<Categoria[]>(`${BASE_URL}categorias/`);
        return response.data;
    } catch(error){
        console.error("Error al obtener categorias:", error);
        return [];
    }
};


export const fetchClasesIngredientes = async(): Promise<ClaseIngrediente[]> =>{

    try{
        const response = await catalogoApi.get<ClaseIngrediente[]>(`${BASE_URL}personalizacion/`);
        return response.data;
    } catch(error){
        console.error("Error al obtener personalización:", error);
        return [];
    }
};






// Funcion para obtener un producto en especifico

export const fetchProductoById = async (id: number): Promise< Producto | null> => {
    try{
        const response = await catalogoApi.get<Producto> (`${BASE_URL}productos/${id}/`);
        return response.data;
    } catch(error){
        console.error(`Error al obtener el producto ${id}:`, error);

        return null;
    }
};

