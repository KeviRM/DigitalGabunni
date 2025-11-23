// frontend-pwa/src/pages/Perfil.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaHistory, FaHeart, FaBoxOpen } from 'react-icons/fa';
import type{ Producto } from '../types/menu';



const PEDIDOS_API_URL = 'http://127.0.0.1:8001/api/v1/pedidos/mis-pedidos/';
const FAVORITOS_API_URL = 'http://127.0.0.1:8000/api/v1/catalogo/favoritos/';

const Perfil: React.FC = () => {
    const { isAuthenticated, getAuthHeaders, logout } = useAuth();
    const navigate = useNavigate();
    const AUTH_HEADERS = { headers: getAuthHeaders() };

    const [activeTab, setActiveTab] = useState<'datos' | 'historial' | 'favoritos'>('historial');
    const [historial, setHistorial] = useState<any[]>([]);
    const [favoritos, setFavoritos] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Datos del usuario (Simulados o decodificados del token si el backend no tiene endpoint 'me')
    // Idealmente: const [user, setUser] = useState<any>(null); 
    // y llamar a un endpoint /api/auth/me/

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'historial') {
                const res = await axios.get(PEDIDOS_API_URL, AUTH_HEADERS);
                setHistorial(res.data);
            } else if (activeTab === 'favoritos') {
                const res = await axios.get(FAVORITOS_API_URL, AUTH_HEADERS);
                setFavoritos(res.data);
            }
        } catch (err) {
            console.error("Error cargando datos", err);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFavorite = async (favId: number) => {
        try {
            await axios.delete(`${FAVORITOS_API_URL}${favId}/`, AUTH_HEADERS);
            setFavoritos(favoritos.filter(f => f.id !== favId));
        } catch (err) { alert("Error al eliminar favorito"); }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-10">
            <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
                
                {/* Sidebar de Navegación del Perfil */}
                <aside className="w-full md:w-1/4 bg-gray-800 text-white p-6">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center text-3xl font-bold mb-3">
                            <FaUser />
                        </div>
                        <h2 className="text-xl font-semibold">Mi Cuenta</h2>
                    </div>
                    
                    <nav className="space-y-2">
                        <button 
                            onClick={() => setActiveTab('datos')}
                            className={`w-full flex items-center p-3 rounded-lg transition ${activeTab === 'datos' ? 'bg-orange-600' : 'hover:bg-gray-700'}`}
                        >
                            <FaUser className="mr-3" /> Mis Datos
                        </button>
                        <button 
                            onClick={() => setActiveTab('historial')}
                            className={`w-full flex items-center p-3 rounded-lg transition ${activeTab === 'historial' ? 'bg-orange-600' : 'hover:bg-gray-700'}`}
                        >
                            <FaHistory className="mr-3" /> Historial
                        </button>
                        <button 
                            onClick={() => setActiveTab('favoritos')}
                            className={`w-full flex items-center p-3 rounded-lg transition ${activeTab === 'favoritos' ? 'bg-orange-600' : 'hover:bg-gray-700'}`}
                        >
                            <FaHeart className="mr-3" /> Favoritos
                        </button>
                    </nav>
                </aside>

                {/* Contenido Principal */}
                <main className="flex-1 p-8 overflow-y-auto">
                    {loading ? <p>Cargando...</p> : (
                        <>
                            {/* VISTA: MIS DATOS */}
                            {activeTab === 'datos' && (
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">Información Personal</h2>
                                    <p className="text-gray-600">Aquí puedes ver y editar tu información.</p>
                                    {/* Formulario de datos personales (Pendiente de implementar endpoint de actualización) */}
                                    <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                                        <p><strong>Usuario:</strong> (Datos del Token)</p>
                                        <p className='mt-2 text-sm text-gray-500'>Para cambiar contraseña, contacta soporte.</p>
                                    </div>
                                </div>
                            )}

                            {/* VISTA: HISTORIAL */}
                            {activeTab === 'historial' && (
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">Historial de Compras</h2>
                                    {historial.length === 0 ? <p>No has realizado pedidos aún.</p> : (
                                        <div className="space-y-4">
                                            {historial.map((pedido: any) => (
                                                <div key={pedido.order_number} className="border rounded-lg p-4 hover:shadow-md transition">
                                                    <div className="flex justify-between mb-2">
                                                        <span className="font-bold text-orange-600">#{pedido.order_number.substring(0,8)}</span>
                                                        <span className="text-sm text-gray-500">{new Date(pedido.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                    <p className="font-semibold">Total: ${parseFloat(pedido.amount).toFixed(2)}</p>
                                                    <span className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${pedido.status === 'ENTREGADO' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                        {pedido.status}
                                                    </span>
                                                    <button 
                                                        onClick={() => navigate(`/pedido/estado/${pedido.order_number}`)}
                                                        className="block mt-3 text-sm text-blue-600 hover:underline"
                                                    >
                                                        Ver Detalles &rarr;
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* VISTA: FAVORITOS */}
                            {activeTab === 'favoritos' && (
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">Mis Favoritos</h2>
                                    {favoritos.length === 0 ? <p>No tienes favoritos guardados.</p> : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {favoritos.map((fav: any) => (
                                                <div key={fav.id} className="border rounded-lg p-4 flex flex-col items-center text-center relative group">
                                                    <button 
                                                        onClick={() => handleRemoveFavorite(fav.id)}
                                                        className="absolute top-2 right-2 text-red-300 hover:text-red-600 text-xl"
                                                        title="Eliminar de favoritos"
                                                    >
                                                        <FaHeart />
                                                    </button>
                                                    
                                                    <div className="h-24 w-full bg-gray-100 mb-3 rounded flex items-center justify-center overflow-hidden">
                                                        {fav.producto_detalle.image ? (
                                                            <img src={fav.producto_detalle.image} className="h-full w-full object-cover" />
                                                        ) : <FaBoxOpen className="text-3xl text-gray-300"/>}
                                                    </div>
                                                    
                                                    <h3 className="font-bold text-gray-800">{fav.producto_detalle.name}</h3>
                                                    <p className="text-green-600 font-bold">${parseFloat(fav.producto_detalle.price).toFixed(2)}</p>
                                                    
                                                    <button 
                                                        onClick={() => navigate(`/producto/${fav.producto}`)}
                                                        className="mt-3 text-sm bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
                                                    >
                                                        Ver Producto
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Perfil;