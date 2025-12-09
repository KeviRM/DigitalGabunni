// frontend-pwa/src/pages/GestionUsuarios.tsx
import React, { useState, useEffect } from 'react';

import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { FaUserPlus, FaTrash, FaUserTie } from 'react-icons/fa';

import { authApi } from '../api/axiosConfig';

interface Usuario {
    id: number;
    username: string;
    email: string;
    first_name: string;
}

// URL del Microservicio de Autenticación
const AUTH_MS_URL = '/api/gestion/cocineros/';

const GestionUsuarios: React.FC = () => {
    const { isAuthenticated, getAuthHeaders, getUserRole } = useAuth();
    const navigate = useNavigate();
    const AUTH_HEADERS = { headers: getAuthHeaders() };

    const [cocineros, setCocineros] = useState<Usuario[]>([]);
    const [nuevoCocinero, setNuevoCocinero] = useState({ username: '', password: '', first_name: '', email: '' });
    const [cargando, setCargando] = useState(true);

    // 1. Cargar lista de cocineros
    const fetchCocineros = async () => {
        try {
            const response = await authApi.get<Usuario[]>(AUTH_MS_URL, AUTH_HEADERS);
            setCocineros(response.data);
        } catch (err) {
            console.error("Error cargando usuarios:", err);
            alert("Error al cargar lista. Verifica que eres Administrador.");
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        const role = getUserRole();
        if (isAuthenticated && role === 'admin') {
            fetchCocineros();
        } else {
            navigate('/admin'); // Redirigir si no es admin
        }
    }, [isAuthenticated]);

    // 2. Crear nuevo cocinero
    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nuevoCocinero.username || !nuevoCocinero.password) return;

        try {
            await authApi.post(AUTH_MS_URL, nuevoCocinero, AUTH_HEADERS);
            alert(`Cocinero ${nuevoCocinero.username} creado exitosamente.`);
            setNuevoCocinero({ username: '', password: '', first_name: '', email: '' }); // Limpiar form
            fetchCocineros(); 
        } catch (err: any) {
            console.error(err);
            alert("Error al crear usuario. El nombre podría estar duplicado.");
        }
    };

    // 3. Eliminar cocinero
    const handleDelete = async (id: number) => {
        if (!window.confirm("¿Eliminar el acceso de este cocinero permanentemente?")) return;
        try {
            await authApi.delete(`${AUTH_MS_URL}${id}/`, AUTH_HEADERS);
            setCocineros(cocineros.filter(c => c.id !== id));
        } catch (err) {
            alert("Error al eliminar.");
        }
    };

    if (cargando) return <div className="p-10 text-center">Cargando personal...</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <h1 className="text-4xl font-extrabold text-gray-800 mb-8 border-b-4 border-blue-600 pb-2 max-w-5xl mx-auto">
                Gestión de Personal - Cocina
            </h1>

            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Formulario de Creación */}
                <div className="md:col-span-1 bg-white p-6 rounded-xl shadow-lg h-fit">
                    <h2 className="text-xl font-bold text-blue-700 mb-4 flex items-center">
                        <FaUserPlus className="mr-2" /> Nuevo Cocinero
                    </h2>
                    <form onSubmit={handleCreate} className="space-y-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase">Usuario</label>
                            <input 
                                type="text" 
                                className="w-full p-2 border rounded"
                                value={nuevoCocinero.username}
                                onChange={e => setNuevoCocinero({...nuevoCocinero, username: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase">Contraseña</label>
                            <input 
                                type="password" 
                                className="w-full p-2 border rounded"
                                value={nuevoCocinero.password}
                                onChange={e => setNuevoCocinero({...nuevoCocinero, password: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase">Nombre (Opcional)</label>
                            <input 
                                type="text" 
                                className="w-full p-2 border rounded"
                                value={nuevoCocinero.first_name}
                                onChange={e => setNuevoCocinero({...nuevoCocinero, first_name: e.target.value})}
                            />
                        </div>
                        <button type="submit" className="w-full py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 mt-2">
                            Registrar Empleado
                        </button>
                    </form>
                </div>

                {/* Lista de Cocineros */}
                <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Personal Activo</h2>
                    {cocineros.length === 0 ? (
                        <p className="text-gray-500">No hay cocineros registrados.</p>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {cocineros.map(cocinero => (
                                <li key={cocinero.id} className="py-4 flex justify-between items-center">
                                    <div className="flex items-center">
                                        <div className="bg-blue-100 p-3 rounded-full mr-4 text-blue-600">
                                            <FaUserTie />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800">{cocinero.username}</p>
                                            <p className="text-sm text-gray-500">{cocinero.first_name || 'Sin nombre'}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleDelete(cocinero.id)}
                                        className="text-red-500 hover:text-red-700 p-2"
                                        title="Eliminar acceso"
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
    );
};

export default GestionUsuarios;