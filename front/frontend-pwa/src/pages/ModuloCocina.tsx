import React, { useState, useEffect, useRef } from 'react';
import { pedidosApi } from '../api/axiosConfig';
import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import type { PedidoStatus } from '../types/pedido';
import { FaFire, FaCheckCircle, FaClipboardList, FaSpinner, FaUtensils, FaCheck } from 'react-icons/fa';
import { useOrderWebSocket } from '../hooks/useOrderWebSocket';

interface PedidoComanda extends PedidoStatus {
    phone_number?: number;
    client_name?: string;
    daily_sequence?: number; // Para mostrar el turno corto (ej. #12)
    created_at?: string;     // Para calcular el tiempo de espera
}

const PEDIDOS_API_URL = '/api/v1/pedidos/';

const ModuloCocina: React.FC = () => {
    const { isAuthenticated, getAuthHeaders } = useAuth();
    const navigate = useNavigate();
    const AUTH_HEADERS = { headers: getAuthHeaders() };

    const { lastMessage } = useOrderWebSocket('cocina');

    const [pedidos, setPedidos] = useState<PedidoComanda[]>([]);
    const [cargando, setCargando] = useState(true);
    const [tick, setTick] = useState(0); // Para forzar actualización de los tiempos cada minuto

    // AHORA INCLUIMOS 'LISTO' PARA LA TERCERA COLUMNA
    const ESTADOS_RELEVANTES = ['CONFIRMADO', 'PREPARACION', 'LISTO'];

    // --- 1. CARGA INICIAL ---
    const fetchPedidos = async () => {
        if (!isAuthenticated) return;
        try {
            const response = await pedidosApi.get<PedidoComanda[]>(`${PEDIDOS_API_URL}gestion/`, AUTH_HEADERS);
            const pedidosActivos = response.data.filter(p => ESTADOS_RELEVANTES.includes(p.status));
            setPedidos(pedidosActivos);
        } catch (err: any) {
            console.error("Error al obtener comandas:", err);
            if (err.response?.status === 401) navigate('/admin');
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        fetchPedidos();
        const interval = setInterval(() => setTick(t => t + 1), 60000); 
        return () => clearInterval(interval);
    }, []);

  
   // ---  WEBSOCKET  ---
    useEffect(() => {
        if (lastMessage) {
            // Si el pedido se entregó o canceló, lo sacamos de la pantalla instantáneamente
            if (lastMessage.status === 'ENTREGADO' || lastMessage.status === 'CANCELADO') {
                setPedidos(prevPedidos => prevPedidos.filter(p => p.order_number !== lastMessage.order_number));
                return;
            }

            fetchPedidos();
        }
    }, [lastMessage]); 



    // --- 3. AVANZAR ESTADO ---
    const handleAvanzarEstado = async (pedidoId: string, estadoActual: string) => {
        let nuevoEstado = '';
        if (estadoActual === 'CONFIRMADO') nuevoEstado = 'PREPARACION';
        else if (estadoActual === 'PREPARACION') nuevoEstado = 'LISTO';
        else if (estadoActual === 'LISTO') nuevoEstado = 'ENTREGADO';
        else return;

        try {
            // Optimistic Update (Se actualiza en pantalla al instante para no hacer esperar al cocinero)
            if (nuevoEstado === 'ENTREGADO') {
                setPedidos(pedidos.filter(p => p.order_number !== pedidoId));
            } else {
                setPedidos(pedidos.map(p => p.order_number === pedidoId ? { ...p, status: nuevoEstado } : p));
            }

            // Petición en segundo plano
            await pedidosApi.patch(`${PEDIDOS_API_URL}gestion/${pedidoId}/`, { status: nuevoEstado }, AUTH_HEADERS);
        } catch (err) {
            alert("Error de conexión al mover el pedido.");
            fetchPedidos(); // Revertimos si falla
        }
    };

    // --- HELPER DE TIEMPO ---
    const calcularTiempo = (fechaIso?: string) => {
        if (!fechaIso) return '0 min';
        const diff = Math.floor((new Date().getTime() - new Date(fechaIso).getTime()) / 60000);
        return diff < 1 ? 'ahora' : `${diff} min`;
    };

    // --- SÚPER HELPER VISUAL PARA COCINA (Sin precios, textos grandes) ---
    const renderPersonalizacionCocina = (personalizacion: any) => {
        if (!personalizacion || typeof personalizacion !== 'object' || Object.keys(personalizacion).length === 0) return null;

        return (
            <div className="mt-2 text-sm pl-2 border-l-4 border-gray-300 ml-1 space-y-1 bg-gray-50 p-2 rounded">
                
                {/* PAQUETES */}
                {(personalizacion.Contenido || personalizacion.contenido) && (
                    <div className="mb-2">
                        <span className="font-bold text-blue-600 uppercase text-xs">Incluye:</span>
                        {(personalizacion.Contenido || personalizacion.contenido).map((item: any, i: number) => (
                            <div key={i} className="text-gray-800 font-bold ml-2">• {item.quantity || 1}x {item.product_name || item.name}</div>
                        ))}
                    </div>
                )}

                {/* MODIFICACIONES (SIN / EXTRAS) */}
                {personalizacion.modificaciones && (
                    <div>
                        {personalizacion.modificaciones.sin && personalizacion.modificaciones.sin.map((ing: any, i: number) => (
                            <div key={`sin-${i}`} className="text-red-600 font-black text-base uppercase">
                                <span className="line-through mr-1 text-red-400">X</span> SIN {ing.name}
                            </div>
                        ))}
                        {personalizacion.modificaciones.extras && personalizacion.modificaciones.extras.map((ing: any, i: number) => (
                            <div key={`extra-${i}`} className="text-green-600 font-black text-base uppercase">
                                + DOBLE {ing.name}
                            </div>
                        ))}
                    </div>
                )}

                {/* CHAPATA PERSONALIZADA */}
                {Object.keys(personalizacion).filter(k => k !== 'modificaciones' && k !== 'Contenido' && k !== 'contenido').length > 0 && (
                    <div>
                        <span className="font-bold text-orange-600 uppercase text-xs">Ingredientes:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {Object.keys(personalizacion)
                                .filter(k => k !== 'modificaciones' && k !== 'Contenido' && k !== 'contenido')
                                .flatMap(k => personalizacion[k])
                                .map((ing: any, i: number) => (
                                    <span key={i} className="bg-orange-100 text-orange-800 font-bold px-2 py-1 rounded text-xs border border-orange-200">
                                        {ing.name}
                                    </span>
                                ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // --- RENDERIZADO DE UN TICKET ---
    const renderTicket = (pedido: PedidoComanda, colorBorder: string, colorHeader: string, btnText: string, btnColor: string, icon: React.ReactNode, nextStatus: string) => {
        const tiempo = calcularTiempo(pedido.created_at);
        const esUrgente = parseInt(tiempo) > 15; // Si pasa de 15 min, lo marcamos como urgente
        
        return (
            <div key={pedido.order_number} className={`bg-white rounded-xl shadow-lg border-t-8 ${colorBorder} flex flex-col overflow-hidden animate-fade-in ${esUrgente && pedido.status !== 'LISTO' ? 'ring-4 ring-red-500 ring-opacity-50' : ''}`}>
                {/* Cabecera del Ticket */}
                <div className={`${colorHeader} px-4 py-3 flex justify-between items-center text-white`}>
                    <div className="flex flex-col">
                        <span className="text-3xl font-black">#{pedido.daily_sequence?.toString().padStart(2, '0') || '??'}</span>
                        <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded inline-block mt-1">
                            {pedido.type_delivery}
                        </span>
                    </div>
                    <div className="text-right">
                        <div className={`font-bold flex items-center gap-1 ${esUrgente ? 'text-red-200 animate-pulse' : 'text-white/80'}`}>
                             {tiempo}
                        </div>
                        <div className="text-sm font-medium mt-1 truncate max-w-[100px]">{pedido.client_name}</div>
                    </div>
                </div>

                {/* Cuerpo del Ticket (Los productos) */}
                <div className="flex-1 p-4 overflow-y-auto bg-gray-50/50">
                    {pedido.details?.map((detalle: any, index: number) => (
                        <div key={index} className="mb-4 bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                            <div className="font-black text-xl text-gray-800 flex items-start gap-2">
                                <span className="text-gray-400 text-lg">{detalle.quantity}x</span> 
                                <span className="leading-tight">{detalle.product_name}</span>
                            </div>
                            {renderPersonalizacionCocina(detalle.personalizacion_json)}
                        </div>
                    ))}
                </div>

                {/* Botón de Acción */}
                <button
                    onClick={() => handleAvanzarEstado(pedido.order_number, pedido.status)}
                    className={`w-full py-5 ${btnColor} text-white font-black text-lg flex items-center justify-center gap-2 hover:brightness-110 transition-all active:scale-95 uppercase tracking-wide`}
                >
                    {icon} {btnText}
                </button>
            </div>
        );
    };

    if (!isAuthenticated) return <div className="text-center text-3xl p-20 text-red-500 font-bold">Acceso no autorizado.</div>;
    if (cargando) return <div className="h-screen bg-gray-800 flex flex-col items-center justify-center text-white"><FaSpinner className="animate-spin text-6xl text-orange-500 mb-4" /><p className="text-2xl font-bold">Cargando Cocina...</p></div>;

    // Clasificación de pedidos para el Kanban
    const pendientes = pedidos.filter(p => p.status === 'CONFIRMADO');
    const enPreparacion = pedidos.filter(p => p.status === 'PREPARACION');
    const listos = pedidos.filter(p => p.status === 'LISTO');

    return (
        <div className="h-screen bg-gray-100 flex flex-col overflow-hidden font-sans">
            {/* Header Global */}
            <div className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center shadow-md z-10">
                <h1 className="text-2xl font-black flex items-center gap-3">
                    <FaUtensils className="text-orange-500" /> KDS Gabunni
                </h1>
                <div className="flex gap-4 font-bold text-sm">
                    <span className="bg-gray-800 px-4 py-2 rounded-full">Total tickets: {pedidos.length}</span>
                </div>
            </div>

            {/* TABLERO KANBAN (3 COLUMNAS) */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 overflow-hidden">
                
                {/* COLUMNA 1: PENDIENTES */}
                <div className="bg-gray-200/50 rounded-2xl flex flex-col overflow-hidden border border-gray-200">
                    <div className="bg-gray-300 py-3 text-center font-black text-gray-700 uppercase tracking-widest shadow-sm">
                         Nuevos ({pendientes.length})
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
                        {pendientes.map(p => renderTicket(p, 'border-gray-500', 'bg-gray-600', 'Preparar', 'bg-gray-800 hover:bg-black', <FaFire />, 'PREPARACION'))}
                    </div>
                </div>

                {/* COLUMNA 2: EN PREPARACIÓN */}
                <div className="bg-orange-50/50 rounded-2xl flex flex-col overflow-hidden border border-orange-100">
                    <div className="bg-orange-200 py-3 text-center font-black text-orange-800 uppercase tracking-widest shadow-sm flex items-center justify-center gap-2">
                         En Plancha ({enPreparacion.length})
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
                        {enPreparacion.map(p => renderTicket(p, 'border-orange-500', 'bg-orange-500', '¡Listo!', 'bg-orange-500 hover:bg-orange-600', <FaCheck />, 'LISTO'))}
                    </div>
                </div>

                {/* COLUMNA 3: LISTOS PARA ENTREGA */}
                <div className="bg-green-50/50 rounded-2xl flex flex-col overflow-hidden border border-green-100">
                    <div className="bg-green-200 py-3 text-center font-black text-green-800 uppercase tracking-widest shadow-sm">
                         Zona de Entrega ({listos.length})
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
                        {listos.map(p => renderTicket(p, 'border-green-500', 'bg-green-600', 'Entregar Cliente', 'bg-green-600 hover:bg-green-700', <FaCheckCircle />, 'ENTREGADO'))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ModuloCocina;