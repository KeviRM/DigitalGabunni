import React, { useState, useEffect, useCallback } from 'react';
import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { FaUserPlus, FaTrash, FaUtensils, FaCashRegister, FaTabletAlt } from 'react-icons/fa';
import { authApi } from '../api/axiosConfig';

interface Usuario {
    id: number;
    username: string;
    email: string;
    first_name: string;
}

const URL_COCINEROS = '/api/gestion/cocineros/'; 
const URL_CAJEROS = '/api/gestion/cajeros/'; 
const URL_KIOSCOS = '/api/gestion/kioscos/';

const GestionUsuarios: React.FC = () => {
    const { isAuthenticated, getAuthHeaders, getUserRole } = useAuth();
    const navigate = useNavigate();
    const AUTH_HEADERS = { headers: getAuthHeaders() };

    // Estados para las listas
    const [cocineros, setCocineros] = useState<Usuario[]>([]);
    const [cajeros, setCajeros] = useState<Usuario[]>([]);
    const [kioscos, setKioscos] = useState<Usuario[]>([]);
    
    // Estado para saber qué pestaña estamos viendo (cocina o caja)
    const [tabActiva, setTabActiva] = useState<'COCINA' | 'CAJA' | 'KIOSCO'>('COCINA');

    // Estado del Formulario
    const [nuevoUsuario, setNuevoUsuario] = useState({ 
        username: '', password: '', first_name: '', email: '', 
        rol: 'COCINERO' 
    });
    
    const [cargando, setCargando] = useState(true);

    // Función unificada para cargar datos
    const fetchData = useCallback(async () => {
        setCargando(true);
        try {
            // Cargamos AMBOS grupos (o puedes cargar solo el activo para optimizar)
            const [resCocineros, resCajeros, resKioscos] = await Promise.all([
                authApi.get<Usuario[]>(URL_COCINEROS, AUTH_HEADERS).catch(() => ({ data: [] })),
                authApi.get<Usuario[]>(URL_CAJEROS, AUTH_HEADERS).catch(() => ({ data: [] })),
                authApi.get<Usuario[]>(URL_KIOSCOS, AUTH_HEADERS).catch(() => ({ data: [] }))
            ]);

            setCocineros(resCocineros.data as Usuario[]);
            setCajeros(resCajeros.data as Usuario[]);
            setKioscos(resKioscos.data as Usuario[]);
        } catch (err) {
            console.error("Error cargando personal:", err);
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => {
        const role = getUserRole();
        if (isAuthenticated && role === 'admin') {
            fetchData();
        } else {
            navigate('/admin');
        }
    }, [isAuthenticated, fetchData, navigate, getUserRole]);

    //  Crear nuevo empleado
    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nuevoUsuario.username || !nuevoUsuario.password) return;

        // Decidir a qué URL enviar según el rol seleccionado
        const urlDestino = nuevoUsuario.rol === 'COCINERO' ? URL_COCINEROS : nuevoUsuario.rol === 'CAJERO' ? URL_CAJEROS : URL_KIOSCOS;

        try {
            await authApi.post(urlDestino, {
                username: nuevoUsuario.username,
                password: nuevoUsuario.password,
                first_name: nuevoUsuario.first_name,
                email: nuevoUsuario.email
            }, AUTH_HEADERS);

            alert(`${nuevoUsuario.rol === 'COCINERO' ? 'Cocinero' : nuevoUsuario.rol === 'CAJERO' ? 'Cajero' : 'K n     iosco'} ${nuevoUsuario.username} creado exitosamente.`);
            
            // Limpiar form pero mantener el rol seleccionado
            setNuevoUsuario(prev => ({ ...prev, username: '', password: '', first_name: '', email: '' }));
            
            // Si creé un cajero, cambio la vista a cajeros para verlo aparecer
            if (nuevoUsuario.rol === 'CAJERO') setTabActiva('CAJA');
            if (nuevoUsuario.rol === 'COCINERO') setTabActiva('COCINA');
            if (nuevoUsuario.rol === 'KIOSCO') setTabActiva('KIOSCO');
            
            fetchData();
        } catch (err: any) {
            console.error(err);
            alert("Error al crear usuario. El nombre podría estar duplicado.");
        }
    };

    //  Eliminar empleado
    const handleDelete = async (id: number, rol: 'COCINA' | 'CAJA' | 'KIOSCO') => {
        if (!window.confirm(`¿Eliminar acceso de este ${rol.toLowerCase()}?`)) return;

        const urlDestino = rol === 'COCINA' ? URL_COCINEROS : rol === 'CAJA' ? URL_CAJEROS : URL_KIOSCOS;

        try {
            await authApi.delete(`${urlDestino}${id}/`, AUTH_HEADERS);
            // Actualizar estado local sin recargar todo
            if (rol === 'COCINA') {
                setCocineros(cocineros.filter(c => c.id !== id));
            }
            else if (rol === 'CAJA') {
                setCajeros(cajeros.filter(c => c.id !== id));
            }
            else if (rol === 'KIOSCO') {
                setKioscos(kioscos.filter(c => c.id !== id));
            }
        } catch (err) {
            alert("Error al eliminar.");
        }
    };

    if (cargando) return <div className="p-20 text-center text-gray-500 font-bold">Cargando Personal...</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <h1 className="text-4xl font-extrabold text-gray-800 mb-8 border-b-4 border-indigo-600 pb-2 max-w-6xl mx-auto">
                Gestión de Personal 
            </h1>

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* --- SECCIÓN IZQUIERDA: FORMULARIO --- */}
                <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg h-fit border-t-4 border-indigo-500">
                    <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <FaUserPlus /> Nuevo Empleado
                    </h2>
                    
                    <form onSubmit={handleCreate} className="space-y-4">
                        {/* Selector de Rol */}
                        <div className="grid grid-cols-3 gap-2 mb-4">
                            <button
                                type="button"
                                onClick={() => setNuevoUsuario({...nuevoUsuario, rol: 'COCINERO'})}
                                className={`p-2 rounded-lg flex flex-col items-center justify-center border-2 transition-all ${nuevoUsuario.rol === 'COCINERO' ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold' : 'border-gray-200 text-gray-400'}`}
                            >
                                <FaUtensils className="mb-1"/> Cocina
                            </button>
                            <button
                                type="button"
                                onClick={() => setNuevoUsuario({...nuevoUsuario, rol: 'CAJERO'})}
                                className={`p-2 rounded-lg flex flex-col items-center justify-center border-2 transition-all ${nuevoUsuario.rol === 'CAJERO' ? 'border-green-500 bg-green-50 text-green-700 font-bold' : 'border-gray-200 text-gray-400'}`}
                            >
                                <FaCashRegister className="mb-1"/> Caja
                            </button>

                            <button
                                type="button"
                                onClick={() => setNuevoUsuario({...nuevoUsuario, rol: 'KIOSCO'})}
                                className={`p-2 rounded-lg flex flex-col items-center justify-center border-2 transition-all ${nuevoUsuario.rol === 'KIOSCO' ? 'border-purple-500 bg-purple-50 text-purple-700 font-bold' : 'border-gray-200 text-gray-400'}`}
                            >
                                <FaTabletAlt className="mb-1"/> Kiosco
                            </button>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase">Usuario</label>
                            <input 
                                type="text" 
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-300 outline-none"
                                value={nuevoUsuario.username}
                                onChange={e => setNuevoUsuario({...nuevoUsuario, username: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase">Contraseña</label>
                            <input 
                                type="password" 
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-300 outline-none"
                                value={nuevoUsuario.password}
                                onChange={e => setNuevoUsuario({...nuevoUsuario, password: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase">Nombre (Opcional)</label>
                            <input 
                                type="text" 
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-300 outline-none"
                                value={nuevoUsuario.first_name}
                                onChange={e => setNuevoUsuario({...nuevoUsuario, first_name: e.target.value})}
                            />
                        </div>

                        <button 
                            type="submit" 
                            className={`w-full py-3 text-white font-bold rounded-lg shadow-md transition-colors mt-4
                                ${nuevoUsuario.rol === 'COCINERO' ? 'bg-blue-600 hover:bg-blue-700' : nuevoUsuario.rol === 'KIOSCO' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-green-600 hover:bg-green-700'}
                            `}
                        >
                            Registrar {nuevoUsuario.rol === 'COCINERO' ? 'Cocinero ' : nuevoUsuario.rol === 'KIOSCO' ? 'Kiosco ' : 'Cajero '}
                        </button>
                    </form>
                </div>

                {/* --- SECCIÓN DERECHA: LISTAS --- */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-[600px]">
                    
                    {/* Tabs de Navegación */}
                    <div className="flex border-b">
                        <button 
                            onClick={() => setTabActiva('COCINA')}
                            className={`flex-1 py-4 font-bold text-center transition-colors flex items-center justify-center gap-2
                                ${tabActiva === 'COCINA' ? 'bg-blue-50 text-blue-600 border-b-4 border-blue-600' : 'text-gray-400 hover:bg-gray-50'}
                            `}
                        >
                            <FaUtensils /> Personal Cocina ({cocineros.length})
                        </button>
                        <button 
                            onClick={() => setTabActiva('CAJA')}
                            className={`flex-1 py-4 font-bold text-center transition-colors flex items-center justify-center gap-2
                                ${tabActiva === 'CAJA' ? 'bg-green-50 text-green-600 border-b-4 border-green-600' : 'text-gray-400 hover:bg-gray-50'}
                            `}
                        >
                            <FaCashRegister /> Personal Caja ({cajeros.length})
                        </button>
                        <button 
                            onClick={() => setTabActiva('KIOSCO')}
                            className={`flex-1 py-4 font-bold text-center transition-colors flex items-center justify-center gap-2
                                ${tabActiva === 'KIOSCO' ? 'bg-purple-50 text-purple-600 border-b-4 border-purple-600' : 'text-gray-400 hover:bg-gray-50'}
                            `}
                        >
                            <FaTabletAlt /> Personal Kiosco ({kioscos.length})
                        </button>
                    </div>

                    {/* Lista Scrolleable */}
                    <div className="p-6 overflow-y-auto flex-1">
                        
                        {/* VISTA COCINEROS */}
                        {tabActiva === 'COCINA' && (
                            <ul className="divide-y divide-gray-100">
                                {cocineros.length === 0 && <p className="text-center text-gray-400 mt-10">No hay cocineros registrados.</p>}
                                {cocineros.map(user => (
                                    <li key={user.id} className="py-4 flex justify-between items-center group hover:bg-blue-50 px-2 rounded transition-colors">
                                        <div className="flex items-center">
                                            <div className="bg-blue-100 p-3 rounded-full mr-4 text-blue-600 shadow-sm">
                                                <FaUtensils />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800">{user.username}</p>
                                                <p className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-full w-fit">
                                                    {user.first_name || 'Sin nombre'}
                                                </p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleDelete(user.id, 'COCINA')}
                                            className="text-gray-300 hover:text-red-500 p-2 transition-colors"
                                            title="Eliminar cocinero"
                                        >
                                            <FaTrash />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {/* VISTA CAJEROS */}
                        {tabActiva === 'CAJA' && (
                            <ul className="divide-y divide-gray-100">
                                {cajeros.length === 0 && <p className="text-center text-gray-400 mt-10">No hay cajeros registrados.</p>}
                                {cajeros.map(user => (
                                    <li key={user.id} className="py-4 flex justify-between items-center group hover:bg-green-50 px-2 rounded transition-colors">
                                        <div className="flex items-center">
                                            <div className="bg-green-100 p-3 rounded-full mr-4 text-green-600 shadow-sm">
                                                <FaCashRegister />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800">{user.username}</p>
                                                <p className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-full w-fit">
                                                    {user.first_name || 'Sin nombre'}
                                                </p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleDelete(user.id, 'CAJA')}
                                            className="text-gray-300 hover:text-red-500 p-2 transition-colors"
                                            title="Eliminar cajero"
                                        >
                                            <FaTrash />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {/* VISTA CAJEROS */}
                        {tabActiva === 'KIOSCO' && (
                            <ul className="divide-y divide-gray-100">
                                {kioscos.length === 0 && <p className="text-center text-gray-400 mt-10">No hay kioscos registrados.</p>}
                                {kioscos.map(user => (
                                    <li key={user.id} className="py-4 flex justify-between items-center group hover:bg-purple-50 px-2 rounded transition-colors">
                                        <div className="flex items-center">
                                            <div className="bg-purple-100 p-3 rounded-full mr-4 text-purple-600 shadow-sm">
                                                <FaTabletAlt />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800">{user.username}</p>
                                                <p className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-full w-fit">
                                                    {user.first_name || 'Sin nombre'}
                                                </p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleDelete(user.id, 'KIOSCO')}
                                            className="text-gray-300 hover:text-red-500 p-2 transition-colors"
                                            title="Eliminar kiosco"
                                        >
                                            <FaTrash />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default GestionUsuarios;