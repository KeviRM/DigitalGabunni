// frontend-pwa/src/pages/ModuloCocina.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import type{ PedidoStatus } from '../types/pedido'; 
import { FaFire, FaCheckCircle, FaClipboardList, FaSpinner } from 'react-icons/fa';

interface PedidoComanda extends PedidoStatus {
    phone_number?: number;
    client_name?: string;
    estado_display: string;
}

const PEDIDOS_API_URL = 'http://127.0.0.1:8001/api/v1/pedidos/';
const POLLING_INTERVAL = 10000; 

const ModuloCocina: React.FC = () => {
    const { isAuthenticated, getAuthHeaders } = useAuth();
    const navigate = useNavigate();
    const AUTH_HEADERS = { headers: getAuthHeaders() };
    
    const [pedidos, setPedidos] = useState<PedidoComanda[]>([]);
    const [cargando, setCargando] = useState(true);

    const ESTADOS_RELEVANTES = ['CONFIRMADO', 'PREPARACION']; 

    // Función para obtener la lista de pedidos
    const fetchPedidos = async () => {
        if (!isAuthenticated) return;
        try {
            // El backend debería ordenar por fecha de creación (ascendente)
            const response = await axios.get<PedidoComanda[]>(`${PEDIDOS_API_URL}gestion/`, AUTH_HEADERS);
            
            // Filtrar los pedidos que están en la etapa de cocina
            const pedidosActivos = response.data.filter(p => 
                ESTADOS_RELEVANTES.includes(p.status)
            );
            setPedidos(pedidosActivos);
        } catch (err) {
            console.error("Error al obtener comandas:", err);
            if (axios.isAxiosError(err) && err.response?.status === 401) {
                navigate('/admin');
            }
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        if (!isAuthenticated) return;
        fetchPedidos();
        // Polling: Actualiza cada 10 seg para ver nuevos pedidos
        const interval = setInterval(fetchPedidos, POLLING_INTERVAL);
        return () => clearInterval(interval);
    }, [isAuthenticated]);

    // Lógica para avanzar el status del pedido
    const handleAvanzarEstado = async (pedidoId: string, estadoActual: string) => {
        let nuevoEstado = '';
        if (estadoActual === 'CONFIRMADO') {
            nuevoEstado = 'PREPARACION';  
        } else if (estadoActual === 'PREPARACION') {
            nuevoEstado = 'LISTO'; 
        } else {
            return;
        }

        try {
            await axios.patch(`${PEDIDOS_API_URL}gestion/${pedidoId}/`, 
                { status: nuevoEstado }, 
                AUTH_HEADERS
            );
            
            // Si el status es LISTO, lo quitamos de la vista (se asume que se pasa al área de entrega)
            if (nuevoEstado === 'LISTO') {
                setPedidos(pedidos.filter(p => p.order_number !== pedidoId));
            } else {
                 // Si es PREPARACION, solo actualizamos el status local
                setPedidos(pedidos.map(p => 
                    p.order_number === pedidoId ? { ...p, status: nuevoEstado, estado_display: nuevoEstado } : p
                ));
            }
        } catch (err) {
            alert("Fallo al actualizar el estado de pedido.");
            console.error("Fallo al actualizar estado", err);
        }
    };
    
    // Función para mostrar el detalle de personalización
    const getPersonalizacionDetalle = (personalizacion: any): string => {
        if (!personalizacion) return "Estándar";
        
        const nombres = Object.values(personalizacion)
            .flatMap((ingredientes: any) => Array.isArray(ingredientes) ? ingredientes.map((ing: any) => ing.name) : []);
        
        return nombres.join(', ');
    };

    if (!isAuthenticated) return <div className="text-center text-3xl p-20 text-red-500">Acceso no autorizado.</div>;
    if (cargando) return <div className="text-center p-20 text-xl font-medium flex items-center justify-center"><FaSpinner className="animate-spin mr-2" /> Cargando Comandas...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <h1 className="text-4xl font-extrabold text-gray-700 mb-6 text-center border-b-2 border-gray-200 pb-2">
                Módulo de Cocina 
            </h1>
            
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                
                {pedidos.length === 0 ? (
                    <div className="col-span-full text-center text-xl text-gray-400 p-10 bg-gray-800 rounded-xl">
                        <FaClipboardList className="text-4xl mx-auto mb-3" />
                        No hay pedidos nuevos para cocinar.
                    </div>
                ) : (
                    pedidos.map(pedido => (
                        <div key={pedido.order_number} 
                             className={`bg-white rounded-xl shadow-2xl p-4 transform transition-all duration-300 ${pedido.status === 'PREPARACION' ? 'border-4 border-green-500' : 'border-4 border-orange-500'}`}
                        >
                            <h2 className="text-2xl font-bold mb-2 flex justify-between items-center">
                                <span>Pedido #{pedido.order_number.substring(0, 8)}</span>
                                <span className='text-sm font-semibold text-gray-500'>{pedido.type_delivery === 'RECOGER' ? 'Recoger' : 'Domicilio'}</span>
                            </h2>
                            <p className="text-sm text-gray-600 mb-3">Cliente: {pedido.client_name} | Tel: {pedido.phone_number}</p>
                            
                            <div className="border-t pt-3 mb-4">
                                <p className="font-extrabold text-lg mb-2 text-gray-800">Comanda Detallada:</p>
                                
                                {pedido.details?.map((detalle, index) => (
                                    <div key={index} className="mb-2 p-2 border-l-2 border-red-500">
                                        <p className="font-semibold text-base">{detalle.quantity}x {detalle.product_name}</p>
                                        
                                        {detalle.personalizacion_json && (
                                            <p className="text-xs text-gray-600">
                                                Ingredientes: {getPersonalizacionDetalle(detalle.personalizacion_json)}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 pt-3 border-t">
                                {pedido.status === 'CONFIRMADO' && (
                                    <button
                                        onClick={() => handleAvanzarEstado(pedido.order_number, 'CONFIRMADO')}
                                        className="w-full py-2 bg-orange-500 text-white font-bold rounded-lg flex items-center justify-center hover:bg-yellow-500 transition-colors"
                                    >
                                        <FaFire className='mr-2' /> Marcar como En Preparación
                                    </button>
                                )}
                                {pedido.status === 'PREPARACION' && (
                                    <button
                                        onClick={() => handleAvanzarEstado(pedido.order_number, 'PREPARACION')}
                                        className="w-full py-2 bg-green-500 text-white font-bold rounded-lg flex items-center justify-center hover:bg-orange-700 transition-colors"
                                    >
                                        <FaCheckCircle className='mr-2' /> Marcar como Listo
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ModuloCocina;