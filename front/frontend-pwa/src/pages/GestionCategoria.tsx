import React, {useEffect, useState} from "react";
import { catalogoApi } from "../api/axiosConfig";

import type { Categoria } from "../types/menu";

import useAuth from "../hooks/useAuth";

const CATALOGO_API_URL = '/api/v1/catalogo/admin/gestion/';




const GestionCategoria: React.FC = () => {
    const [cargando, setCargando] = useState(true);
    const [categorias, setCategorias] = useState<Categoria[]>([]);

    const[categoriaEditando, setCategoriaEditando] =useState<Categoria | null>(null);
    

    const { getAuthHeaders, isAuthenticated } = useAuth();    
    const AUTH_HEADERS = {headers : getAuthHeaders()};


    const [nuevaCategoria, setNuevaCategoria] = useState({
        name: ''
    });



    const fetchCategorias = async () => {
        setCargando(true);

        if(!isAuthenticated){
            alert("Acceso no autorizado. Debe iniciar sesion.");
            setCargando(false);
            return;
        }
        try {
            const categRes = await catalogoApi.get<Categoria[]>(`${CATALOGO_API_URL}categorias/`, AUTH_HEADERS);

            setCategorias(categRes.data);
        } catch (err) {
            console.error("Error al cargar categorias:", err);
            alert("No se pudieron cargar las categorias. Revisa la autenticacion");
        } finally {
            setCargando(false);
        }

    };




    useEffect(() => {
        fetchCategorias();
    }, []);




    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        
        
        const data = categoriaEditando || nuevaCategoria;
        for (const key in data) {
            // Excluir claves que no son necesarias o no existen en el modelo (como id)
            if (key !== 'id') {
                 // Añadimos solo los campos de texto
                formData.append(key, data[key] === null ? '' : String(data[key]));
            }
        }

       

        try {
            if (categoriaEditando) {
                // Edicion
                await catalogoApi.put(`${CATALOGO_API_URL}categorias/${categoriaEditando.id}/`, formData, AUTH_HEADERS);
                alert("Categoria actualizada exitosamente.");
            } else {
                // Creacion
                await catalogoApi.post(`${CATALOGO_API_URL}categorias/`, formData, AUTH_HEADERS);
                alert("Categoria creada exitosamente.");
                setNuevaCategoria({ name: '' });
            }

            fetchCategorias();
        } catch (err: any) {
            console.error("Error al guardar categoria:", err);
            alert("Error al guardar categoria. Revisa los datos e intenta nuevamente.");
        }
    };



    //Manejar eliminacion

    const handleDelete = async (id: number, name: string) => {
        if (!window.confirm("¿Estás seguro de que deseas eliminar esta categoría? Esta acción no se puede deshacer.")) {
            return;
        }
        try {
            await catalogoApi.delete(`${CATALOGO_API_URL}categorias/${id}/`, AUTH_HEADERS);
            alert(`Categoría ${name} eliminada exitosamente.`);
            fetchCategorias();
        } catch (err) {
            console.error("Error al eliminar categoría:", err);
            alert("Error al eliminar categoría. Puede que esté en uso.");
        }
    };



    if (cargando) return <div className="text-center p-20">Cargando gestión de categoria...</div>;


    if (!isAuthenticated && !cargando) {
        return <div className="text-center p-20 text-red-500">Acceso no autorizado. Por favor, inicia sesión.</div>;
    }

    return (

        <div className="min-h-screen bg-gray-100 p-6">
            <h1 className="text-4xl font-extrabold text-gray-800 mb-8 border-b-4 border-gray-200 pb-2 max-w-7xl mx-auto">
                Administración de Categorias
            </h1>

            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 grap-8">

                {/* Columna uno formulario */}
                <div className="bg-white p-6 rounded-xl shadow-lg h-fit">
                    <h2 className="text-xl font-bold text-orange-700 mb-4"> Añadir Nueva Categoria</h2>
                    <form onSubmit={handleSubmit}>

                        

                        {/* Campo Nombre */}
                        <input 
                            type="text"
                            placeholder="Nombre de la categoria"
                            value={categoriaEditando ? categoriaEditando.name : nuevaCategoria.name}
                            onChange={(e) => categoriaEditando ? setCategoriaEditando({...categoriaEditando, name: e.target.value}) : setNuevaCategoria({...nuevaCategoria, name: e.target.value})}
                            className="w-full p-3 border rounded-lg mb-4"
                            required
                        />

                        


                        <div className='flex gap-2'>
                            <button
                                type="submit"
                                className="flex-1 py-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition-colors"
                            >
                                {categoriaEditando ? 'Guardar Cambios' : 'Crear Categoria'}
                            </button>
                            {categoriaEditando && (
                                <button
                                    type="button"
                                    onClick={() => setCategoriaEditando(null)}
                                    className="py-3 px-4 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Cancelar
                                </button>
                            )}
                        </div>


                    </form>
                </div>



              

                {/* tabla de cateogorias */}

                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg overflow-x-auto">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Categorias existentes</h2>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {categorias.map(categoria => (
                                <tr key={categoria.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{categoria.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{categoria.name}</td>
                                    
                                    
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button 
                                            onClick={() => setCategoriaEditando(categoria)}
                                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDelete(categoria.id, categoria.name)}
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


        </div>




    );



};


export default GestionCategoria;