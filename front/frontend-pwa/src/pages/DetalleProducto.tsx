// frontend-pwa/src/pages/DetalleProducto.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type{ Producto, RecetaItem, ItemCarrito} from '../types/menu';
import { fetchProductoById } from '../api/menuApi'; // Asegúrate que tu fetch trae la receta
import { useCarrito } from '../context/CarritoContext';


import useAuth from '../hooks/useAuth';

import { FaHeart, FaRegHeart } from 'react-icons/fa';

import {catalogoApi} from '../api/axiosConfig';




const FAVORITOS_API_URL = '/api/v1/catalogo/favoritos/';

const DetalleProducto: React.FC = () => {
    const { productoId } = useParams<{ productoId: string }>();
    const navigate = useNavigate();
    const [producto, setProducto] = useState<Producto | null>(null);
    const [cargando, setCargando] = useState(true);
    const { agregarItem } = useCarrito();


    const { isAuthenticated, getAuthHeaders } = useAuth();
    const [esFavorito, setEsFavorito] = useState(false);


    useEffect(() => {
        const id = parseInt(productoId || '0');
        if (id === 0) return;

        fetchProductoById(id).then(prodData => {
            setProducto(prodData);
            setCargando(false);
        });
    }, [productoId]);

    const handleToggleFavorite = async () => {
        if (!isAuthenticated) {
            alert("Debes iniciar sesión para guardar favoritos.");
            return;
        }
        
        try {
            const AUTH_HEADERS = { headers: getAuthHeaders() };
            // NOTA: Para toggle real (añadir/quitar), necesitaríamos saber si ya es favorito.
            // Por simplicidad, aquí solo implementamos "Añadir".
            await catalogoApi.post(FAVORITOS_API_URL, { producto: producto?.id }, AUTH_HEADERS);
            setEsFavorito(true);
            alert("¡Añadido a tus favoritos!");
        } catch (err) {
            alert("Ya está en tus favoritos o hubo un error.");
        }
    };



    const handleAddToCart = () => {
        if (!producto) return;

        const itemParaCarrito: Omit<ItemCarrito, 'idUnico' | 'cantidad'> = {
            productoBase: producto,
            precioUnitario: parseFloat(producto.price), 
            personalizacion: undefined,
        };

        agregarItem(itemParaCarrito);
        alert(`¡${producto.name} añadido al carrito!`);
        navigate('/carrito'); 
    };


    










    if (cargando || !producto) {
        return <div className="text-center p-8 text-xl font-medium">Cargando detalles...</div>;
    }
    


   

    return (
        <div className="min-h-screen bg-white p-6 md:p-10">
            <div className="max-w-4xl mx-auto">
                <button onClick={() => navigate('/')} className="text-gray-600 hover:text-gray-800 mb-6 flex items-center">
                    &larr; Volver
                </button>
                
                <div className="md:flex gap-8">
                    {/* Imagen (Vista Izquierda - similar a image_52a0ea.png) */}
                    <div className="md:w-1/2">
                        <img 
                            src={producto.image || 'https://i.pinimg.com/originals/fb/1a/3b/fb1a3bfd4fb96c76d9f877b57259b345.jpg'} 
                            alt={producto.name} 
                            className="w-full h-auto rounded-lg shadow-xl"
                        />
                        <div className="mt-8 flex flex-nowrap gap-10">
                            <button
                                // Llamamos a la función de añadir directo en lugar de navegar a personalizar
                                onClick={handleAddToCart}
                                className="w-4/5 py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors"
                            >
                                Añadir al Carrito (${Number(producto.price).toFixed(2)})
                            </button>

                            <button 
                                onClick={handleToggleFavorite}
                                className={` w-1/5 text-3xl focus:outline-none transition-colors ${esFavorito ? 'text-red-500' : 'text-gray-300 hover:text-red-400'}`}
                                title="Añadir a favoritos"
                            >
                                {esFavorito ? <FaHeart /> : <FaRegHeart />}
                            </button>
                        </div>
                    </div>

                    {/* Detalles e Ingredientes Fijos (Vista Derecha) */}
                    <div className="md:w-1/2 pt-6 md:pt-0">
                        <h1 className="text-4xl font-extrabold text-orange-700 mb-2">{producto.name}</h1>
                        <p className="text-lg text-gray-500 mb-4">{producto.category_name}</p>
                        <p className="text-2xl font-bold text-green-800 mb-6">${Number(producto.price).toFixed(2)}</p>
                        <h2 className="text-xl font-bold text-gray-800 mb-3">Descripción</h2>
                        <p className="text-gray-700 mb-8">{producto.description}</p>

                        {/* Ingredientes Fijos */}
                        <h2 className="text-xl font-bold text-gray-800 mb-3">Ingredientes</h2>
                        <ul className="space-y-2">
                            {(producto.receta || []).map((recetaItem: RecetaItem, index) => (
                                <li key={`${recetaItem.ingredient}-${index}`} className="flex items-center text-gray-700">
                                    <span className="mr-2 text-green-500">&rarr;</span> 
                                    {recetaItem.ingrediente_name} 
                                    {recetaItem.quantity && (
                                        <span className='text-sm text-gray-500 ml-2'>
                                            ({recetaItem.quantity} {recetaItem.unidad})
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetalleProducto;