import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import type { PedidoStatus, DetalePedidoAPI } from '../types/pedido';

import useAuth from "../hooks/useAuth";
import { useOrderWebSocket } from '../hooks/useOrderWebSocket';

const PEDIDOS_API_URL = 'http://127.0.0.1:8001/api/v1/pedidos/';

interface DetallePedidoExtended extends DetalePedidoAPI {
    personalizacion_detalle?: string;
}

interface PedidoAdmin extends PedidoStatus {
    phone_number: number;
    client_name: string;
    estado_display: string;
    details: DetallePedidoExtended[];
}

const ESTADOS = [
    { value: 'CONFIRMADO', label: 'Confirmado' },
    { value: 'PREPARACION', label: 'En Preparación' },
    { value: 'LISTO', label: 'Listo' },
    { value: 'ENTREGADO', label: 'Entregado' },
    { value: 'CANCELADO', label: 'Cancelado' },
];


const ESTADOS_FILTRO = [
    { value: 'CONFIRMADO', label: 'Confirmado' },
    { value: 'PREPARACION', label: 'En Preparación' },
    { value: 'LISTO', label: 'Listo' },
    { value: 'ENTREGADO', label: 'Entregado' },
    { value: 'CANCELADO', label: 'Cancelado' },
];


const PanelAdmin: React.FC = () => {
    const [pedidos, setPedidos] = useState<PedidoAdmin[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filtros
    const [filtros, setFiltros] = useState({
        estados: [] as string[], // Almacena múltiples estados seleccionados
        fecha_inicio: '',
        fecha_fin: '',
        busqueda: '',
    })

    const { getAuthHeaders, isAuthenticated } = useAuth();
    const { lastMessage } = useOrderWebSocket('cocina');



    const buildQueryUrl = useCallback(() => {
        const params = new URLSearchParams();

        // Filtro por Estado (Multiple)
        filtros.estados.forEach(estado => {
            params.append('status', estado);
        });

        // Filtro por Rango de Fechas
        if (filtros.fecha_inicio) params.append('fecha_rango_after', filtros.fecha_inicio);
        if (filtros.fecha_fin) params.append('fecha_rango_before', filtros.fecha_fin);

        // Filtro de Búsqueda (UUID o Cliente)
        if (filtros.busqueda) params.append('busqueda', filtros.busqueda);

        return `${PEDIDOS_API_URL}gestion/?${params.toString()}`;
    }, [filtros]);

    // Obtener la lista de pedidos al cargar
    const fetchPedidos = useCallback(async () => {
        setCargando(true);

        if (!isAuthenticated) {
            return;
        }

        try {
            const AUTH_HEADERS = { headers: getAuthHeaders() };
            const url = buildQueryUrl();

            // Llama al nuevo endpoint de gestión
            const response = await axios.get<PedidoAdmin[]>(url, AUTH_HEADERS);
            setPedidos(response.data);
            setError(null);
        } catch (err) {
            console.error("Error al obtener pedidos:", err);
            setError("Error al cargar los pedidos. ¿El servidor de Pedidos está activo y la autenticación es correcta?");
        } finally {
            setCargando(false);
        }
    }, [isAuthenticated, getAuthHeaders, buildQueryUrl]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchPedidos();
        }
    }, [isAuthenticated, fetchPedidos]);

    useEffect(() => {
        if (lastMessage) {
            setPedidos(prev => {
                const index = prev.findIndex(p => p.order_number === lastMessage.order_number);
                
                // Si existe, actualizamos la fila
                if (index !== -1) {
                    const nuevos = [...prev];
                    nuevos[index] = { ...nuevos[index], ...lastMessage };
                    return nuevos;
                }
                
                // Si es nuevo, lo ponemos al principio de la tabla
                return [lastMessage, ...prev];
            });
        }
    }, [lastMessage]);

    ///CHECKBOXS DE ESTADO
    const handleEstadoToggle = (estado: string) => {
        setFiltros(prev => {
            const nuevosEstados = prev.estados.includes(estado)
                ? prev.estados.filter(e => e !== estado)
                : [...prev.estados, estado];
            return { ...prev, estados: nuevosEstados };
        });
    };

    // Resetear todos los filtros 
    const handleResetFiltros = () => {
        setFiltros({
            estados: [],
            fecha_inicio: '',
            fecha_fin: '',
            busqueda: '',
        });
    };

    // Lógica para cambiar el estado
    const handleEstadoChange = async (pedidoId: string, nuevoEstado: string) => {
        try {
            const AUTH_HEADERS = { headers: getAuthHeaders() };

            // PATCH al endpoint de detalle para actualizar solo el campo 'estado'
            await axios.patch(`${PEDIDOS_API_URL}gestion/${pedidoId}/`,
                { status: nuevoEstado },
                AUTH_HEADERS
            );

            // Actualizar el estado local para reflejar el cambio
            setPedidos(pedidos.map(p =>
                p.order_number === pedidoId ? { ...p, status: nuevoEstado as any, estado_display: ESTADOS.find(e => e.value === nuevoEstado)?.label || nuevoEstado } : p
            ));
        } catch (err) {
            console.error("Error al actualizar estado:", err);
            alert("Fallo al actualizar el estado del pedido.");
        }
    };

    if (cargando) return <div className="text-center p-20">Cargando panel de administración...</div>;
    if (error) return <div className="text-center p-20 text-red-500">{error}</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <h1 className="text-4xl font-extrabold text-gray-800 mb-8 border-b-4 border-orange-600 pb-2 max-w-7xl mx-auto">
                Panel de Control de Pedidos
            </h1>

            {/* --- Interfaz de Filtros Combinados --- */}
            <div className="max-w-7xl mx-auto bg-white p-6 rounded-xl shadow-lg mb-8">
                <h2 className="text-xl font-bold text-gray-700 mb-4">Filtros Avanzados</h2>

                {/* Fila de Búsqueda y Fechas */}
                <div className="flex flex-wrap gap-4 mb-4 items-end">

                    {/* Búsqueda por Texto */}
                    <div className='flex-1 min-w-[200px]'>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Buscar por Cliente/UUID</label>
                        <input
                            type="text"
                            placeholder="Nombre o #UUID"
                            value={filtros.busqueda}
                            onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
                            className="w-full p-2 border rounded-lg"
                        />
                    </div>

                    {/* Filtro Fecha Inicio */}
                    <div className='min-w-[150px]'>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
                        <input
                            type="date"
                            value={filtros.fecha_inicio}
                            onChange={(e) => setFiltros({ ...filtros, fecha_inicio: e.target.value })}
                            className="p-2 border rounded-lg"
                        />
                    </div>

                    {/* Filtro Fecha Fin */}
                    <div className='min-w-[150px]'>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
                        <input
                            type="date"
                            value={filtros.fecha_fin}
                            onChange={(e) => setFiltros({ ...filtros, fecha_fin: e.target.value })}
                            className="p-2 border rounded-lg"
                        />
                    </div>

                    {/* Botón de Reset */}
                    <button
                        onClick={handleResetFiltros}
                        className="p-2 h-fit bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Resetear Filtros
                    </button>
                </div>

                {/* Fila de Filtro por Estado */}
                <div className="mt-4 border-t pt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por Estado:</label>
                    <div className="flex flex-wrap gap-3">
                        {ESTADOS_FILTRO.map(status => (
                            <button
                                key={status.value}
                                onClick={() => handleEstadoToggle(status.value)}
                                className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${filtros.estados.includes(status.value)
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {status.label}
                            </button>
                        ))}
                    </div>
                </div>

            </div>

            <div className="max-w-7xl mx-auto">
                {pedidos.length === 0 ? (
                    <p className="text-center text-gray-500">No hay pedidos pendientes.</p>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {pedidos.map(pedido => (
                            <div key={pedido.order_number} className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-orange-500">

                                <div className="flex justify-between items-start mb-4">
                                    <h2 className="text-xl font-bold text-orange-700">Pedido #{pedido.order_number.substring(0, 8)}</h2>
                                    <div className={`px-3 py-1 text-sm font-semibold rounded-full ${pedido.status === 'LISTO' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {pedido.estado_display}
                                    </div>
                                </div>

                                <p className="text-sm text-gray-600 mb-2">Cliente: **{pedido.client_name}** | Tel: {pedido.phone_number}</p>
                                <p className="text-sm text-gray-600 mb-4">Entrega: **{pedido.type_delivery}** | Total: **${Number(pedido.amount).toFixed(2)}**</p>

                                {/* Detalles del Pedido (Comanda para Cocina) */}
                                <div className="border-t pt-3 mt-3">
                                    <p className="font-semibold text-gray-700 mb-2">Comanda:</p>
                                    {pedido.details.map((detalle, index) => (
                                        <div key={index} className="text-xs mb-2 pl-2 border-l-2 border-gray-200">
                                            <span className='font-bold'>{detalle.quantity}x {detalle.product_name}</span>
                                            {/* Usamos el campo simplificado que creamos en el Serializer */}
                                            <p className='text-gray-500'>Ingredientes: {detalle.personalizacion_json ? detalle.personalizacion_detalle : 'Estándar'}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Control de Estado */}
                                <div className="mt-4 flex items-center space-x-3">
                                    <label className="text-sm font-medium">Cambiar Estado:</label>
                                    <select
                                        value={pedido.status}
                                        onChange={(e) => handleEstadoChange(pedido.order_number, e.target.value)}
                                        className="p-2 border rounded-lg text-sm bg-white"
                                    >
                                        {ESTADOS.map(estado => (
                                            <option key={estado.value} value={estado.value}>
                                                {estado.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PanelAdmin;