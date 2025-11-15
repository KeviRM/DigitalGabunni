import React, {useState, useEffect} from "react";
import axios from "axios";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import type { Ingrediente, ClaseIngrediente } from "../types/menu";



interface Unidad{
    id : number;
    name : string;
    abbreviation: string;
}


interface IngredienteGestion extends Ingrediente {
    unidad_medida : number | null;
    _class : number | null;
}


const CATALOGO_API_URL = 'http://127.0.0.1:8000/api/v1/catalogo/admin/gestion/';


const GestionIngredientes: React.FC = () => {
    const { isAuthenticated, getAuthHeaders } = useAuth();
    const navigate = useNavigate();
    const AUTH_HEADERS = { headers: getAuthHeaders() };
    
    const [ingredientesBase, setIngredientesBase] = useState<IngredienteGestion[]>([]);
    const [unidades, setUnidades] = useState<Unidad[]>([]);
    const [clases, setClases] = useState<ClaseIngrediente[]>([]);

    const [cargando, setCargando] = useState(false);





const fetchDatos = async () => {
        if (!isAuthenticated) return;
        setCargando(true);
        try {
            const [ingRes, unidadRes, claseRes] = await Promise.all([
                axios.get<IngredienteGestion[]>(`${CATALOGO_API_URL}ingredientes/`, AUTH_HEADERS),
                axios.get<Unidad[]>(`${CATALOGO_API_URL}unidades/`, AUTH_HEADERS),
                axios.get<ClaseIngrediente[]>(`${CATALOGO_API_URL}personalizacion/`, AUTH_HEADERS), // Reusamos el endpoint de clases
            ]);
            
            setIngredientesBase(ingRes.data);
            setUnidades(unidadRes.data);
            setClases(claseRes.data);
        } catch (err) {
            console.error("Error al cargar datos:", err);
            alert("Error al cargar datos. Revisa la conexión de la API.");
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchDatos();
        } else {
            navigate('/admin');
        }
    }, [isAuthenticated, navigate]);


    // 1. Lógica de Actualización de Ingrediente (PATCH)
    const handleUpdateIngrediente = async (ingredienteId: number, data: Partial<IngredienteGestion>) => {
        try {
            await axios.patch(`${CATALOGO_API_URL}ingredientes/${ingredienteId}/`, data, AUTH_HEADERS);
            
            // Actualizar el estado local después del éxito
            setIngredientesBase(prev => prev.map(i => {
                if (i.id === ingredienteId) {
                    const nuevaAbreviatura = data.unidad_medida !== undefined ? unidades.find(u => u.id === data.unidad_medida)?.abreviatura || 'No asignada' : i.unidad_abreviatura;
                    const nuevaClaseNombre = data._class !== undefined ? clases.find(c => c.id === data.clase)?.nombre || 'Sin Clase' : i.clase_nombre;
                    
                    return {
                        ...i, 
                        ...data as IngredienteGestion, // Aseguramos que data se fusione
                        unidad_abreviatura: nuevaAbreviatura,
                        clase_nombre: nuevaClaseNombre,
                    };
                }
                return i;
            }));
            
            alert("Ingrediente actualizado correctamente.");
        } catch (err: any) {
            console.error("Error al actualizar ingrediente:", err.response?.data || err);
            alert("Fallo al actualizar el ingrediente. Revisa el formato de datos.");
        }
    };

    //  Lógica de Creación de Nuevo Ingrediente (POST)
    // ...

    if (!isAuthenticated || cargando) return <div className="text-center p-20">Cargando gestión de ingredientes...</div>;

    // --- Renderizado de la Tabla de Gestión ---
    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <h1 className="text-4xl font-extrabold text-gray-800 mb-8 border-b-4 border-gray-200 pb-2 max-w-7xl mx-auto">
                Gestión de Ingredientes 
            </h1>
            
            {/* PENDIENTE: Formulario de Creación/Edición */}

            {/* Tabla de Gestión */}
            <div className="max-w-7xl mx-auto bg-white p-6 rounded-xl shadow-lg overflow-x-auto mt-6">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Add.</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clase</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unidad Asignada</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {ingredientesBase.map(ing => (
                            <tr key={ing.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ing.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${Number(ing.additional_price).toFixed(2)}</td>
                                
                                {/* Selector de CLASE de Ingrediente */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <select
                                        value={ing._class || ''}
                                        onChange={(e) => handleUpdateIngrediente(ing.id, { _class: Number(e.target.value) || null })}
                                        className="p-2 border rounded-lg text-sm"
                                    >
                                        <option value="">Sin Asignar</option>
                                        {clases.map(clase => (
                                            <option key={clase.id} value={clase.id}>{clase.name}</option>
                                        ))}
                                    </select>
                                </td>

                                {/* Selector de UNIDAD de Medida */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <select
                                        value={ing.unidad_medida || ''}
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
                                    {/* PENDIENTE: Botón para editar nombre/precio o eliminar */}
                                    <button className="text-red-600 hover:text-red-900">Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default GestionIngredientes;