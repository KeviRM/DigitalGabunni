import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaHistory, FaHeart, FaBoxOpen, FaBell } from 'react-icons/fa';
import type { Producto } from '../types/menu';

import usePushNotification from '../hooks/usePushNotification';

const PEDIDOS_API_URL = 'http://127.0.0.1:8001/api/v1/pedidos/mis-pedidos/';
const FAVORITOS_API_URL = 'http://127.0.0.1:8000/api/v1/catalogo/favoritos/';

const AUTH_ME_URL = 'http://127.0.0.1:8002/api/auth/me/';

const Perfil: React.FC = () => {
    const { isAuthenticated, getAuthHeaders, logout } = useAuth();
    const navigate = useNavigate();
    const AUTH_HEADERS = { headers: getAuthHeaders() };

    const [activeTab, setActiveTab] = useState<'datos' | 'historial' | 'favoritos'>('historial');
    const [historial, setHistorial] = useState<any[]>([]);
    const [favoritos, setFavoritos] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [userData, setUserData] = useState<any>(null);

    const { subscribeToPush } = usePushNotification();

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
             else if (activeTab === 'datos') {
                // LLAMADA AL NUEVO ENDPOINT
                const res = await axios.get(AUTH_ME_URL, AUTH_HEADERS);
                setUserData(res.data);
             }
        } catch (err) {
            console.error("Error cargando datos", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchData();
    }, [activeTab, isAuthenticated]);

   

    const handleRemoveFavorite = async (favId: number) => {
        try {
            await axios.delete(`${FAVORITOS_API_URL}${favId}/`, AUTH_HEADERS);
            setFavoritos(favoritos.filter(f => f.id !== favId));
        } catch (err) { alert("Error al eliminar favorito"); }
    };



    const handlePagarPedido = async (numeroPedido: string) => {
        try {
            // Usamos el mismo endpoint que en el Checkout
            const response = await axios.post(
                'http://127.0.0.1:8001/api/v1/pedidos/crear-pago/', 
                { order_id: numeroPedido }, 
                { headers: getAuthHeaders() }
            );

            // Si todo sale bien, redirigimos a Mercado Pago
            if (response.data.init_point) {
                window.location.href = response.data.init_point;
            } else {
                alert("Error al generar el link de pago.");
            }
        } catch (err) {
            console.error("Error recuperando pago:", err);
            alert("No se pudo iniciar el pago. Por favor intenta de nuevo.");
        }
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

                        <button onClick={subscribeToPush} className="flex items-center p-3 rounded-lg border bg-gray-600 hover:bg-green-500">
                            <FaBell className='mr-3' />
                            Activar Notificaciones de Pedidos
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
                                    
                                    {userData ? (
                                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                                            <div className="flex items-center space-x-4 mb-4">
                                                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 text-2xl font-bold">
                                                    {userData.first_name?.[0] || userData.username[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-800">
                                                        {userData.first_name} {userData.last_name}
                                                    </h3>
                                                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                                        {userData.rol}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="text-sm text-gray-500 block">Nombre de Usuario</label>
                                                    <p className="font-medium text-gray-800">{userData.username}</p>
                                                </div>
                                                <div>
                                                    <label className="text-sm text-gray-500 block">Correo Electrónico</label>
                                                    <p className="font-medium text-gray-800">{userData.email}</p>
                                                </div>
                                                <div>
                                                    <label className="text-sm text-gray-500 block">Miembro desde</label>
                                                    <p className="font-medium text-gray-800">{userData.date_joined}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <p>Cargando información...</p>
                                    )}
                                </div>
                            )}

                            {/* VISTA: HISTORIAL */}
                            {activeTab === 'historial' && (
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">Historial de Compras</h2>
                                    {historial.length === 0 ? <p>No has realizado pedidos aún.</p> : (
                                        <div className="space-y-4">
                                            {historial.map((pedido: any) => (
                                                <div key={pedido.order_number} className="bg-white p-4 rounded-lg shadow border border-gray-200 mb-4">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="font-bold text-gray-800">Pedido #{pedido.order_number.substring(0,8)}</p>
                                                            <p className="text-sm text-gray-500">{new Date(pedido.created_at).toLocaleDateString()}</p>
                                                        </div>
                                                        
                                                        {/* Etiqueta de Estado */}
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                            pedido.status === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-700' :
                                                            pedido.status === 'CONFIRMADO' ? 'bg-blue-100 text-blue-700' :
                                                            pedido.status === 'Listo' ? 'bg-green-100 text-green-700' :
                                                            'bg-gray-100 text-gray-600'
                                                        }`}>
                                                            {pedido.status}
                                                        </span>
                                                    </div>

                                                    {/* Detalles breves (opcional) */}
                                                    <div className="mt-2 text-sm text-gray-600">
                                                        Total: <span className="font-bold">${pedido.amount}</span>
                                                    </div>

                                                    {/* --- BOTÓN DE ACCIÓN PARA PENDIENTES --- */}
                                                    {pedido.status === 'PENDIENTE' && (
                                                        <div className="mt-4 flex gap-3">
                                                            <button 
                                                                onClick={() => handlePagarPedido(pedido.order_number)}
                                                                className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 transition-colors shadow-md text-sm"
                                                            >
                                                                Pagar Ahora 
                                                            </button>
                                                            {/* Opcional: Botón para cancelar si quisieras implementarlo */}
                                                            {/* <button className="text-red-500 text-sm underline">Cancelar</button> */}
                                                        </div>
                                                    )}
                                                    
                                                    {/* Botón para ver seguimiento si YA está pagado */}
                                                    {pedido.status !== 'PENDIENTE' && (
                                                        <button 
                                                            onClick={() => navigate(`/pedido/estado/${pedido.order_number}`)}
                                                            className="mt-4 w-full bg-gray-100 text-gray-700 py-2 rounded-lg font-bold hover:bg-gray-200 text-sm"
                                                        >
                                                            Ver Seguimiento
                                                        </button>
                                                    )}
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
                                                        ) : <FaBoxOpen className="text-3xl text-gray-300" />}
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