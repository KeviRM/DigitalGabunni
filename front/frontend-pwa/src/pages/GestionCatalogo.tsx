
import React, {useEffect, useState} from "react";
import axios from "axios";
import type{ Producto, Ingrediente } from "../types/menu";
import useAuth from "../hooks/useAuth";


const CATALOGO_API_URL = 'http://127.0.0.1:8000/api/v1/catalogo/admin/gestion/';

interface Unidad {
    id: number;
    nombre: string;
    abbreviation: string;
}

interface IngredienteGestion extends Ingrediente {
    unidad_medida: number | null; 
}

const GestionCatalogo: React.FC = () => {
    const [unidades, setUnidades] = useState<Unidad[]>([]);
    const [productos, setProductos] = useState<Producto[]>([]);
    const [cargando, setCargando] = useState(true);
    const[productoEditando, setProductoEditando] =useState<Producto | null>(null);

    const [ingredientesBase, setIngredientesBase] = useState<IngredienteGestion[]>([]);


    const { getAuthHeaders, isAuthenticated } = useAuth();
    const AUTH_HEADERS = {headers: getAuthHeaders()};


    const [nuevoProducto, setNuevoProducto] = useState({
        name: '',
        description: '',
        price: '0.00',
        category: 1,
    });


const fetchProductos = async () => {
    setCargando(true);
    if (!isAuthenticated) { 
             alert("Acceso denegado. Debes iniciar sesión.");
             setCargando(false);
             return;
    }
    try{

        const [prodRes, unidadRes, ingRes] = await Promise.all([
                axios.get<Producto[]>(`${CATALOGO_API_URL}productos/`, AUTH_HEADERS),
                axios.get<Unidad[]>(`${CATALOGO_API_URL}unidades/`, AUTH_HEADERS), // Nuevo fetch de unidades
                axios.get<IngredienteGestion[]>(`${CATALOGO_API_URL}ingredientes/`, AUTH_HEADERS), 
            ]);
        setProductos(prodRes.data);
        setUnidades(unidadRes.data);
        setIngredientesBase(ingRes.data);


    } catch(err) {
            console.error("Error al cargar productos de administración:", err);
            alert("Error al cargar productos. ¿Estás logueado como administrador?");
    } finally {
        setCargando(false);
    }
};



useEffect(() => {
    fetchProductos();
    
}, []);


// 2. Manejar la creación/actualización (CRUD: POST/PUT)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (productoEditando) {
                // PUT/PATCH para actualizar el producto existente (Criterio de Aceptación: Modificar)
                await axios.put(`${CATALOGO_API_URL}productos/${productoEditando.id}/`, productoEditando, AUTH_HEADERS);
                alert(`Producto ${productoEditando.name} actualizado.`);
                setProductoEditando(null);
            } else {
                // POST para crear un nuevo producto (Criterio de Aceptación: Agregar)
                await axios.post(`${CATALOGO_API_URL}productos/`, nuevoProducto, AUTH_HEADERS);
                alert(`Producto ${nuevoProducto.name} creado.`);
                setNuevoProducto({ name: '', description: '', price: '0.00', category: 1 });
            }
            fetchProductos(); // Recargar la lista
        } catch (err: any) {
            console.error("Error en la operación CRUD:", err.response?.data || err);
            alert("Fallo en la operación. Revisa la consola.");
        }
    };

    //  Manejar la eliminación (CRUD: DELETE)
    const handleDelete = async (id: number, nombre: string) => {
        if (!window.confirm(`¿Estás seguro de eliminar ${nombre}?`)) return;

        try {
            await axios.delete(`${CATALOGO_API_URL}productos/${id}/`, AUTH_HEADERS);
            alert(`Producto ${nombre} eliminado.`);
            fetchProductos(); // Recargar la lista
        } catch (err) {
            console.error("Error al eliminar:", err);
            alert("Fallo al eliminar el producto.");
        }
    };





    const handleUpdateIngrediente = async (ingredienteId: number, data: { unidad_medida: number | null }) => {
        try {
            await axios.patch(`${CATALOGO_API_URL}ingredientes/${ingredienteId}/`, data, AUTH_HEADERS);
            
            // --- ACTUALIZACIÓN LOCAL DEL ESTADO ---
            // Encontramos la abreviatura de la unidad
            const nuevaAbreviatura = unidades.find(u => u.id === data.unidad_medida)?.abbreviation || 'No asignada';

            // Actualizamos el estado de ingredientesBase localmente
            setIngredientesBase(prev => prev.map(i => 
                i.id === ingredienteId 
                    ? { 
                        ...i, 
                        ...data, 
                        unidad_abreviatura: nuevaAbreviatura,
                        unidad_medida: data.unidad_medida // Actualizar el ID para que el select se muestre correctamente
                      } 
                    : i
            ));
            alert("Unidad de medida asignada correctamente.");

        } catch (err: any) {
            console.error("Error al actualizar ingrediente:", err.response?.data || err);
            alert("Fallo al actualizar el ingrediente.");
        }
    };















    if (cargando) return <div className="text-center p-20">Cargando gestión de catálogo...</div>;


    if (!isAuthenticated && !cargando) {
        return <div className="text-center p-20 text-red-500">Acceso no autorizado. Por favor, inicia sesión.</div>;
    }



    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <h1 className="text-4xl font-extrabold text-gray-800 mb-8 border-b-4 border-gray-200 pb-2 max-w-7xl mx-auto">
                Administración de Productos
            </h1>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Columna 1: Formulario de Creación/Edición */}
                <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg h-fit">
                    <h2 className="text-2xl font-bold text-orange-700 mb-4">
                        {productoEditando ? `Editar: ${productoEditando.name}` : 'Crear Nuevo Producto'}
                    </h2>
                    
                    <form onSubmit={handleSubmit}>
                        {/* Campo Nombre */}
                        <input 
                            type="text"
                            placeholder="Nombre del Producto/Paquete"
                            value={productoEditando ? productoEditando.name : nuevoProducto.name}
                            onChange={(e) => productoEditando ? setProductoEditando({...productoEditando, name: e.target.value}) : setNuevoProducto({...nuevoProducto, name: e.target.value})}
                            className="w-full p-3 border rounded-lg mb-4"
                            required
                        />
                        {/* Campo Descripción */}
                        <textarea
                            placeholder="Descripción"
                            value={productoEditando ? productoEditando.description : nuevoProducto.description}
                            onChange={(e) => productoEditando ? setProductoEditando({...productoEditando, description: e.target.value}) : setNuevoProducto({...nuevoProducto, description: e.target.value})}
                            rows={3}
                            className="w-full p-3 border rounded-lg mb-4"
                        />
                        {/* Campo Precio */}
                        <input
                            type="number"
                            step="0.01"
                            placeholder="Precio Base"
                            value={productoEditando ? productoEditando.price : nuevoProducto.price}
                            onChange={(e) => productoEditando ? setProductoEditando({...productoEditando, price: e.target.value}) : setNuevoProducto({...nuevoProducto, price: e.target.value})}
                            className="w-full p-3 border rounded-lg mb-4"
                            required
                        />
                        {/* Campo Categoría (Simplificado) */}
                        <p className='text-sm text-gray-500 mb-2'>Categoría ID (Simplificado)</p>
                        <input
                            type="number"
                            value={productoEditando ? productoEditando.category : nuevoProducto.category}
                            onChange={(e) => productoEditando ? setProductoEditando({...productoEditando, category: Number(e.target.value)}) : setNuevoProducto({...nuevoProducto, category: Number(e.target.value)})}
                            className="w-full p-3 border rounded-lg mb-4"
                            required
                        />
                        {/* Botones */}
                        <div className='flex gap-2'>
                            <button
                                type="submit"
                                className="flex-1 py-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition-colors"
                            >
                                {productoEditando ? 'Guardar Cambios' : 'Crear Producto'}
                            </button>
                            {productoEditando && (
                                <button
                                    type="button"
                                    onClick={() => setProductoEditando(null)}
                                    className="py-3 px-4 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Cancelar
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Columna 2: Tabla de Productos */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg overflow-x-auto">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Productos Actuales</h2>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {productos.map(producto => (
                                <tr key={producto.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{producto.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{producto.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${Number(producto.price).toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{producto.category_name || producto.category}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button 
                                            onClick={() => setProductoEditando(producto)}
                                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDelete(producto.id, producto.name)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>







{/* Ingredientes y unidades */}







            <div className="max-w-7xl mx-auto mt-10">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-2 pb-2">
                    Gestión de Ingredientes
                </h2>
                
                <div className="bg-white p-6 rounded-xl shadow-lg overflow-x-auto">
                    {/* Usamos el mismo patrón de tabla para listar y editar ingredientes */}
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Add.</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unidad Actual</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asignar Unidad</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {/* NOTA: Debes cargar los ingredientes para que 'ingredientesBase' exista. 
                            Asumo que tienes la lista de ingredientes cargada desde una función similar a fetchIngredientes. */}
                            {/* PENDIENTE: Reemplaza 'ingredientesBase' con tu estado actual de ingredientes cargados para gestión */}
                            {ingredientesBase.map(ing => ( 
                                <tr key={ing.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ing.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${Number(ing.additional_price).toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ing.unidad_abreviatura || 'No asignada'}</td>
                                    
                                    {/* Selector de Unidad */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <select
                                            value={ing.unidad_medida || ''} // Si el campo de la API se llama unidad_medida
                                            onChange={(e) => handleUpdateIngrediente(ing.id, { unidad_medida: Number(e.target.value) || null })}
                                            className="p-2 border rounded-lg text-sm"
                                        >
                                            <option value="">---</option>
                                            {unidades.map(unidad => (
                                                <option key={unidad.id} value={unidad.id}>{unidad.abbreviation}</option>
                                            ))}
                                        </select>
                                    </td>
                                    
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {/* Puedes añadir un botón para editar otros campos (nombre, precio) en un modal */}
                                        <button className="text-indigo-600 hover:text-indigo-900">Editar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>


                            



    



        
    );

   



};

export default GestionCatalogo;




