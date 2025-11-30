import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useAuth from '../hooks/useAuth';
import { FaPlus, FaEdit, FaTrash, FaCheckSquare, FaDotCircle } from 'react-icons/fa';

// Interfaces
interface Ingrediente {
    id?: number;
    name: string;
    additional_price: string;
    available: boolean;
    _class: number;
}

interface ClaseIngrediente {
    id?: number;
    name: string;
    single_selection: boolean;
    required: boolean;
    ingredientes: Ingrediente[];
}

const CATALOGO_API_URL = 'http://127.0.0.1:8000/api/v1/catalogo/';

const GestionIngredientes: React.FC = () => {
    const { getAuthHeaders } = useAuth();
    const AUTH_HEADERS = { headers: getAuthHeaders() };

    // Estados
    const [clases, setClases] = useState<ClaseIngrediente[]>([]);
    const [claseSeleccionada, setClaseSeleccionada] = useState<ClaseIngrediente | null>(null);
    
    // Formularios
    const [formClase, setFormClase] = useState({ name: '', single_selection: false, required:false });
    const [formIngrediente, setFormIngrediente] = useState({ name: '', additional_price: '0', available: true });
    
    const [editandoClase, setEditandoClase] = useState<number | null>(null);
    const [editandoIngrediente, setEditandoIngrediente] = useState<Ingrediente | null>(null);



    //Toggle rápido de disponibilidad de ingrediente
    const toggleDisponibilidadIngrediente = async (ing: Ingrediente) => {
        try {
            // Enviamos el opuesto del valor actual
            await axios.patch(
                `${CATALOGO_API_URL}ingredientes/${ing.id}/`, 
                { available: !ing.available }, 
                AUTH_HEADERS
            );
            // Recargamos la lista (o actualizamos estado local optimista)
            fetchClases();
        } catch (err) { alert("Error al actualizar disponibilidad"); }
    };
    // Cargar Datos
    const fetchClases = async () => {
        try {
            const res = await axios.get(`${CATALOGO_API_URL}personalizacion/`, AUTH_HEADERS);
            setClases(res.data);
            // Si hay una seleccionada, refrescarla
            if (claseSeleccionada) {
                const actualizada = res.data.find((c: any) => c.id === claseSeleccionada.id);
                setClaseSeleccionada(actualizada || null);
            }
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchClases(); }, []);

    // --- LÓGICA DE CLASES ---
    const handleSaveClase = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editandoClase) {
                await axios.patch(`${CATALOGO_API_URL}personalizacion/${editandoClase}/`, formClase, AUTH_HEADERS);
            } else {
                await axios.post(`${CATALOGO_API_URL}personalizacion/`, formClase, AUTH_HEADERS);
            }
            setFormClase({ name: '', single_selection: false, required:false });
            setEditandoClase(null);
            fetchClases();
        } catch (err) { alert("Error al guardar clase"); }
    };

    const handleDeleteClase = async (id: number) => {
        if (!confirm("¿Eliminar clase? Se borrarán todos sus ingredientes.")) return;
        try {
            await axios.delete(`${CATALOGO_API_URL}personalizacion/${id}/`, AUTH_HEADERS);
            setClaseSeleccionada(null);
            fetchClases();
        } catch (err) { alert("Error al eliminar"); }
    };

    const startEditClase = (c: ClaseIngrediente) => {
        setEditandoClase(c.id!);
        setFormClase({ name: c.name, single_selection: c.single_selection , required: c.required});
    };

    // --- LÓGICA DE INGREDIENTES ---
    const handleSaveIngrediente = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!claseSeleccionada?.id) return;
        
        const payload = { ...formIngrediente, _class: claseSeleccionada.id };

        try {
            if (editandoIngrediente?.id) {
                await axios.patch(`${CATALOGO_API_URL}ingredientes/${editandoIngrediente.id}/`, payload, AUTH_HEADERS);
            } else {
                await axios.post(`${CATALOGO_API_URL}ingredientes/`, payload, AUTH_HEADERS);
            }
            setFormIngrediente({ name: '', additional_price: '0', available: true });
            setEditandoIngrediente(null);
            fetchClases(); // Recargar para ver cambios
        } catch (err) { alert("Error al guardar ingrediente"); }
    };

    const handleDeleteIngrediente = async (id: number) => {
        if (!confirm("¿Eliminar ingrediente?")) return;
        try {
            await axios.delete(`${CATALOGO_API_URL}ingredientes/${id}/`, AUTH_HEADERS);
            fetchClases();
        } catch (err) { alert("Error al eliminar"); }
    };

    const startEditIngrediente = (ing: Ingrediente) => {
        setEditandoIngrediente(ing);
        setFormIngrediente({ name: ing.name, additional_price: ing.additional_price, available: ing.available });
    };

    return (
        <div className="p-6 min-h-screen bg-gray-100">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Gestión de Ingredientes y Extras </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* COLUMNA IZQUIERDA: Clases */}
                <div className="md:col-span-1 bg-white p-4 rounded-xl shadow">
                    <h2 className="text-xl font-bold mb-4 border-b pb-2">1. Categorías</h2>
                    
                    {/* Formulario Clase */}
                    <form onSubmit={handleSaveClase} className="mb-6 bg-gray-50 p-3 rounded">
                        <input 
                            className="w-full p-2 border rounded mb-2" 
                            placeholder="Nombre (ej: Pan, Queso)" 
                            value={formClase.name}
                            onChange={e => setFormClase({...formClase, name: e.target.value})}
                            required
                        />
                        <div className="flex flex-col space-y-2 mb-2">
                            <label className="flex items-center space-x-2 text-sm text-gray-700">
                                <input 
                                    type="checkbox"
                                    checked={formClase.single_selection}
                                    onChange={e => setFormClase({...formClase, single_selection: e.target.checked})}
                                />
                                <span>Selección Única </span>
                            </label>

                            {/* NUEVO CHECKBOX REQUERIDO */}
                            <label className="flex items-center space-x-2 text-sm text-gray-700">
                                <input 
                                    type="checkbox"
                                    checked={formClase.required}
                                    onChange={e => setFormClase({...formClase, required: e.target.checked})}
                                    className="text-red-500 focus:ring-red-500"
                                />
                                <span className="font-bold text-red-600">Requerido </span>
                            </label>
                        </div>

                        <button className="w-full bg-blue-600 text-white py-1 rounded font-bold">
                            {editandoClase ? 'Actualizar Categoría' : 'Crear Categoría'}
                        </button>
                    </form>

                    {/* Lista Clases */}
                    <ul className="space-y-2">
                        {clases.map(c => (
                            <li 
                                key={c.id} 
                                onClick={() => { setClaseSeleccionada(c); setEditandoIngrediente(null); }}
                                className={`p-3 rounded cursor-pointer flex justify-between items-center transition ${claseSeleccionada?.id === c.id ? 'bg-orange-100 border-l-4 border-orange-500' : 'bg-gray-50 hover:bg-gray-100'}`}
                            >
                                <div>
                                    <span className="font-bold  flex items-center">
                                        {c.name}
                                        {c.required && <span className="ml-2 text-[10px] bg-red-100 text-red-600 px-1 rounded border border-red-200">requerido</span>}
                                    </span>
                                    <span className="text-xs text-gray-500 flex items-center">
                                        {c.single_selection ? <><FaDotCircle className="mr-1"/> Solo 1</> : <><FaCheckSquare className="mr-1"/> Varios</>}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={(e) => { e.stopPropagation(); startEditClase(c); }} className="text-blue-500"><FaEdit /></button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteClase(c.id!); }} className="text-red-500"><FaTrash /></button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* COLUMNA DERECHA: Ingredientes */}
                <div className="md:col-span-2 bg-white p-4 rounded-xl shadow">
                    {claseSeleccionada ? (
                        <>
                            <h2 className="text-xl font-bold mb-4 border-b pb-2 flex justify-between">
                                <span>2. Ingredientes de: <span className="text-orange-600">{claseSeleccionada.name}</span></span>
                                <span className="text-sm font-normal bg-gray-200 px-2 py-1 rounded">
                                    {claseSeleccionada.single_selection ? "El cliente elegirá solo UNO" : "El cliente puede elegir VARIOS"}
                                </span>
                            </h2>

                            {/* Formulario Ingrediente */}
                            <form onSubmit={handleSaveIngrediente} className="flex gap-3 mb-6 bg-gray-50 p-3 rounded items-end">
                                <div className="grow">
                                    <label className="text-xs font-bold text-gray-500">Nombre</label>
                                    <input 
                                        className="w-full p-2 border rounded" 
                                        placeholder="Ej: Ajo, Parmesano"
                                        value={formIngrediente.name}
                                        onChange={e => setFormIngrediente({...formIngrediente, name: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="w-32">
                                    <label className="text-xs font-bold text-gray-500">Precio Extra ($)</label>
                                    <input 
                                        type="number" step="0.5"
                                        className="w-full p-2 border rounded" 
                                        value={formIngrediente.additional_price}
                                        onChange={e => setFormIngrediente({...formIngrediente, additional_price: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <button className="h-10 px-4 bg-green-600 text-white rounded font-bold flex items-center">
                                        {editandoIngrediente ? 'Guardar' : <FaPlus />}
                                    </button>
                                </div>
                            </form>

                            {/* Tabla Ingredientes */}
                            <table className="w-full text-left">
                                <thead className="bg-gray-100 text-gray-500 text-xs uppercase">
                                    <tr>
                                        <th className="p-2">Nombre</th>
                                        <th className="p-2">Precio Extra</th>
                                        <th className="p-2">Estado</th>
                                        <th className="p-2 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {claseSeleccionada.ingredientes?.map(ing => (
                                        <tr key={ing.id} className="hover:bg-gray-50">
                                            <td className="p-2 font-medium">{ing.name}</td>
                                            <td className="p-2 text-green-600 font-bold">+${Number(ing.additional_price).toFixed(2)}</td>
                                                <button 
                                                    onClick={() => toggleDisponibilidadIngrediente(ing)}
                                                    className={`text-xs px-2 py-1 rounded font-bold border ${
                                                        ing.available 
                                                            ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200' 
                                                            : 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200'
                                                    }`}
                                                >
                                                    {ing.available ? 'Disponible' : 'AGOTADO'}
                                                </button>
                                            <td className="p-2 text-right space-x-2">
                                                <button onClick={() => startEditIngrediente(ing)} className="text-blue-500"><FaEdit /></button>
                                                <button onClick={() => handleDeleteIngrediente(ing.id!)} className="text-red-500"><FaTrash /></button>
                                            </td>
                                        </tr>
                                    ))}
                                    {claseSeleccionada.ingredientes?.length === 0 && (
                                        <tr><td colSpan={4} className="p-4 text-center text-gray-500">No hay ingredientes en esta categoría.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            <p>Selecciona una categoría a la izquierda para gestionar sus ingredientes.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GestionIngredientes;