// frontend-pwa/src/pages/GestionRecetas.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import type{ Producto, Ingrediente, RecetaItem } from '../types/menu'; 

// URLs de los endpoints del Microservicio de Catálogo
const CATALOGO_API_URL = 'http://127.0.0.1:8000/api/v1/catalogo/admin/gestion/';

const GestionRecetas: React.FC = () => {
    const { isAuthenticated, getAuthHeaders } = useAuth();
    const navigate = useNavigate();
    // Headers de autenticación para todas las peticiones
    const AUTH_HEADERS = { headers: getAuthHeaders() };
    
    const [productos, setProductos] = useState<Producto[]>([]);
    const [ingredientesBase, setIngredientesBase] = useState<Ingrediente[]>([]);
    const [recetas, setRecetas] = useState<RecetaItem[]>([]);
    const [productoSeleccionadoId, setProductoSeleccionadoId] = useState<number | ''>('');
    
    // Estado para el formulario de adición
    const [nuevoIngredienteId, setNuevoIngredienteId] = useState<number | ''>('');
    const [cantidad, setCantidad] = useState('1');
    
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);


    // 1. Cargar datos iniciales (Productos e Ingredientes)
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/admin'); 
            return;
        }

        const fetchDatos = async () => {
            setCargando(true);
            try {
                // Endpoint de gestión de productos (trae todos)
                const [prodRes, ingRes] = await Promise.all([
                    axios.get<Producto[]>(`${CATALOGO_API_URL}productos/`, AUTH_HEADERS),
                    // Endpoint de gestión de ingredientes
                    axios.get<Ingrediente[]>(`${CATALOGO_API_URL}ingredientes/`, AUTH_HEADERS) 
                ]);
                setProductos(prodRes.data.filter(p => p.category_name === 'chapatas')); // Filtrar solo chapatas
                setIngredientesBase(ingRes.data);
                setError(null);
            } catch (err) {
                console.error("Error al cargar datos base:", err);
                setError("Error al cargar productos o ingredientes. Verifica el Microservicio de Catálogo.");
            } finally {
                setCargando(false);
            }
        };
        fetchDatos();
    }, [isAuthenticated, navigate]);

    // 2. Hook para cargar recetas del producto seleccionado (se ejecuta al cambiar el selector)
    const fetchRecetas = async (id: number) => {
        try {
            // Endpoint de gestión de recetas, filtrado por producto_id
            const response = await axios.get<RecetaItem[]>(
                `${CATALOGO_API_URL}recetas/?producto_id=${id}`, 
                AUTH_HEADERS
            );
            setRecetas(response.data);
            return response.data;
        } catch (err) {
            console.error("Error al cargar recetas:", err);
            setRecetas([]);
            return [];
        }
    };
    
    useEffect(() => {
        if (productoSeleccionadoId) {
            fetchRecetas(Number(productoSeleccionadoId));
        } else {
            setRecetas([]);
        }
    }, [productoSeleccionadoId]);


    // 3. Agregar un ingrediente a la receta (POST)
    const handleAddReceta = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!productoSeleccionadoId || !nuevoIngredienteId || Number(cantidad) <= 0) {
            alert("Selecciona un ingrediente y una cantidad válida.");
            return;
        }

        try {
            const newReceta: RecetaItem = {
                product: Number(productoSeleccionadoId),
                ingredient: Number(nuevoIngredienteId),
                quantity: cantidad,
            };
            
            const response = await axios.post(`${CATALOGO_API_URL}recetas/`, newReceta, AUTH_HEADERS);
            
            // Actualizar la lista local con el nuevo ítem devuelto por el servidor
            setRecetas([...recetas, response.data]);
            
            // Resetear formulario de adición
            setNuevoIngredienteId('');
            setCantidad('1');
        } catch (err: any) {
            console.error("Error al añadir ingrediente:", err.response?.data || err);
            alert("Error al añadir. Puede que el ingrediente ya haya sido agregado a esta chapata.");
        }
    };
    
    // 4. Eliminar un ingrediente de la receta (DELETE)
    const handleDeleteReceta = async (id: number) => {
        if (!window.confirm("¿Seguro que quieres eliminar este ingrediente de la receta?")) return;
        try {
            await axios.delete(`${CATALOGO_API_URL}recetas/${id}/`, AUTH_HEADERS);
            setRecetas(recetas.filter(r => r.id !== id));
        } catch (err) {
            alert("Error al eliminar.");
            console.error("Error al eliminar ingrediente:", err);

        }
    };

    if (!isAuthenticated || cargando) return <div className="text-center p-20">Cargando gestión de recetas...</div>;
    if (error) return <div className="text-center p-20 text-red-500">{error}</div>;

    const productoActual = productos.find(p => p.id === productoSeleccionadoId);
    const ingredienteSeleccionado = ingredientesBase.find(i => i.id === nuevoIngredienteId);

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <h1 className="text-4xl font-extrabold text-gray-800 mb-8 border-b-4 border-orange-500 pb-2 max-w-7xl mx-auto">
                Gestión de Recetas 
            </h1>

            <div className="max-w-7xl mx-auto bg-white p-6 rounded-xl shadow-lg">
                
                {/* Selector de Producto */}
                <div className="mb-6 pb-4 border-b">
                    <label className="block text-lg font-semibold mb-2">Seleccionar Chapata Establecida:</label>
                    <select
                        value={productoSeleccionadoId}
                        onChange={(e) => setProductoSeleccionadoId(Number(e.target.value))}
                        className="p-3 border rounded-lg w-full md:w-1/2"
                    >
                        <option value="">-- Selecciona un Producto --</option>
                        {productos.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>

                {/* Formulario para Añadir Ingrediente */}
                {productoSeleccionadoId && (
                    <form onSubmit={handleAddReceta} className="grid grid-cols-4 gap-4 items-end mb-8 p-4 bg-gray-50 rounded-lg">
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-sm font-medium mb-1">Ingrediente:</label>
                            <select
                                value={nuevoIngredienteId}
                                onChange={(e) => setNuevoIngredienteId(Number(e.target.value))}
                                className="p-3 border rounded-lg w-full"
                                required
                            >
                                <option value="">-- Elegir Ingrediente --</option>
                                {ingredientesBase.map(ing => (
                                    <option key={ing.id} value={ing.id}>{ing.name}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="col-span-1 md:col-span-1">
                            <label className="block text-sm font-medium mb-1">Cantidad:</label>
                            <input
                                type="number"
                                step="0.01"
                                value={cantidad}
                                onChange={(e) => setCantidad(e.target.value)}
                                className="p-3 border rounded-lg w-full"
                                required
                            />
                        </div>

                         <div className="col-span-1 md:col-span-1">
                            <label className="block text-sm font-medium mb-1">Unidad:</label>
                            <input
                                type="text"
                                readOnly
                                // Muestra la abreviatura de la unidad de medida del ingrediente
                                value={ingredienteSeleccionado?.unidad_abreviatura || 'N/A'} 
                                className="p-3 border rounded-lg w-full bg-gray-100"
                            />
                        </div>
                        
                        <button type="submit" className="col-span-4 md:col-span-1 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700">
                            Añadir a Receta
                        </button>
                    </form>
                )}

                {/* Lista de Recetas Actuales */}
                <h2 className="text-xl font-bold text-gray-800 mb-4 mt-8">
                    Receta de: {productoActual?.name || 'Selecciona un producto'}
                </h2>
                {recetas.length > 0 ? (
                    <ul className="space-y-3">
                        {recetas.map(r => (
                            <li key={r.id} className="flex justify-between items-center p-3 border rounded-lg bg-gray-50">
                                <span className="font-semibold">{r.ingrediente_nombre}</span>
                                <span className="text-sm text-gray-600">
                                    {r.quantity} {ingredientesBase.find(i => i.name === r.ingrediente_nombre)?.unidad_abreviatura || 'unidades'}
                                </span>
                                <button
                                    onClick={() => handleDeleteReceta(r.id!)}
                                    className="text-red-500 hover:text-red-700 font-medium text-sm"
                                >
                                    Eliminar
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    productoSeleccionadoId && <p className="text-gray-500">Esta chapata aún no tiene ingredientes fijos definidos. ¡Añade uno!</p>
                )}

            </div>
        </div>
    );
};

export default GestionRecetas;