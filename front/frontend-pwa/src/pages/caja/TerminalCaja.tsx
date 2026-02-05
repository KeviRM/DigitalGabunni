import React, { useState, useEffect } from "react";
import { pedidosApi } from '../../api/axiosConfig'; 
import useAuth from "../../hooks/useAuth";
import ModalCobro from "../../components/ModalCobro";
import { FaClock, FaArrowRight, FaCashRegister } from 'react-icons/fa';

const TerminalCaja = () => {
    const [pedidos, setPedidos] = useState<any[]>([]);
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState<any | null>(null);
    
    // Estados para el cobro
    const [modalAbierto, setModalAbierto] = useState(false);
    const { getAuthHeaders } = useAuth();

    // 1. Cargar Pedidos
    const fetchPedidos = async () => {
        try {
            const url = '/api/v1/pedidos/gestion/?status=CONFIRMADO&status=PREPARACION&status=LISTO';
            const response = await pedidosApi.get(url, { headers: getAuthHeaders() });
            // Filtramos solo los NO pagados
            const pendientes = response.data.filter((p: any) => !p.metodo_pago);
            setPedidos(pendientes);
            
            // Si el pedido seleccionado ya no existe, limpiamos la selección
            if (pedidoSeleccionado) {
                const sigueVivo = pendientes.find((p: any) => p.order_number === pedidoSeleccionado.order_number);
                if (!sigueVivo) setPedidoSeleccionado(null);
            }
        } catch (error) {
            console.error("Error cargando terminal", error);
        }
    };

    // Polling: Actualizar cada 5 segundos automáticamente
    useEffect(() => {
        fetchPedidos();
        const intervalo = setInterval(fetchPedidos, 5000);
        return () => clearInterval(intervalo);
    }, []);

    // Helper para "Hace X minutos"
    const calcularTiempo = (fechaIso: string) => {
        const fecha = new Date(fechaIso);
        const ahora = new Date();
        const diffMinutos = Math.floor((ahora.getTime() - fecha.getTime()) / 60000);
        if (diffMinutos < 1) return 'hace un momento';
        if (diffMinutos < 60) return `hace ${diffMinutos} minutos`;
        return `hace ${Math.floor(diffMinutos / 60)} horas`;
    };

    return (
        <div className="flex h-full">
            
            {/* --- COLUMNA IZQUIERDA: LISTA DE PEDIDOS --- */}
            <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col h-full">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-orange-500 border-b-2 border-orange-200 pb-2 inline-block">
                        Pendientes de Pago ({pedidos.length})
                    </h2>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                    {pedidos.length === 0 && (
                        <p className="text-center text-gray-400 mt-10">No hay pedidos pendientes.</p>
                    )}

                    {pedidos.map((pedido) => (
                        <div 
                            key={pedido.order_number}
                            onClick={() => setPedidoSeleccionado(pedido)}
                            className={`p-4 rounded-xl cursor-pointer transition-all border-l-4 shadow-sm group
                                ${pedidoSeleccionado?.order_number === pedido.order_number 
                                    ? 'bg-orange-50 border-orange-500 shadow-md ring-1 ring-orange-100' 
                                    : 'bg-white hover:bg-gray-50 border-gray-200 border'
                                }`}
                        >
                            <div className="flex justify-between items-center mb-2">
                                <span className={`text-xl font-bold ${pedidoSeleccionado?.order_number === pedido.order_number ? 'text-orange-600' : 'text-gray-400 group-hover:text-orange-400'}`}>
                                    #{pedido.order_number.substring(0, 4)}
                                </span>
                                <span className="text-xl font-extrabold text-green-600">
                                    ${parseFloat(pedido.amount).toFixed(0)}
                                </span>
                            </div>
                            <div className="flex justify-between items-end">
                                <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                                    <FaClock /> {calcularTiempo(pedido.created_at || new Date().toISOString())}
                                </span>
                                {pedidoSeleccionado?.order_number === pedido.order_number && 
                                    <FaArrowRight className="text-orange-400" />
                                }
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- COLUMNA DERECHA: DETALLE DEL PEDIDO --- */}
            <div className="w-2/3 bg-gray-50 p-8 flex flex-col justify-center items-center h-full">
                
                {pedidoSeleccionado ? (
                    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90%]">
                        {/* Header Ticket */}
                        <div className="bg-gray-800 text-white p-6 text-center relative">
                            <p className="text-sm text-gray-400 uppercase tracking-widest mb-1">Orden Actual</p>
                            <h2 className="text-3xl font-bold">Pedido #{pedidoSeleccionado.order_number.substring(0, 8)}</h2>
                            <div className="absolute top-6 right-6 px-3 py-1 bg-gray-700 rounded-full text-xs font-bold text-orange-400">
                                {pedidoSeleccionado.type_delivery}
                            </div>
                        </div>

                        {/* Cuerpo Lista */}
                        <div className="p-8 overflow-y-auto flex-1">
                            <h3 className="text-gray-500 font-bold mb-4 text-sm uppercase border-b pb-2">Detalle de Consumo</h3>
                            <div className="space-y-4">
                                {pedidoSeleccionado.details.map((detalle: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <span className="bg-orange-100 text-orange-700 font-bold w-8 h-8 flex items-center justify-center rounded-lg">
                                                {detalle.quantity}
                                            </span>
                                            <div>
                                                <p className="font-bold text-gray-800 text-lg">{detalle.product_name}</p>
                                                {detalle.personalizacion_detalle && (
                                                    <p className="text-xs text-gray-400">{detalle.personalizacion_detalle}</p>
                                                )}
                                            </div>
                                        </div>
                                        <p className="font-bold text-gray-700 text-lg">
                                            ${(parseFloat(detalle.unit_price) * detalle.quantity).toFixed(2)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer Totales */}
                        <div className="bg-gray-50 p-8 border-t border-gray-100">
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-gray-500 font-medium">Total a Pagar</span>
                                <span className="text-5xl font-extrabold text-gray-800">
                                    ${parseFloat(pedidoSeleccionado.amount).toFixed(2)}
                                </span>
                            </div>
                            
                            <button 
                                onClick={() => setModalAbierto(true)}
                                className="w-full bg-green-600 hover:bg-green-700 text-white text-xl font-bold py-5 rounded-xl shadow-lg transform hover:scale-[1.01] transition-all flex justify-center items-center gap-3"
                            >
                                <FaCashRegister /> COBRAR AHORA
                            </button>
                        </div>
                    </div>
                ) : (
                    // ESTADO VACÍO (Placeholder)
                    <div className="text-center opacity-40">
                        <FaCashRegister className="text-9xl text-gray-400 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold text-gray-600">Terminal Lista</h2>
                        <p className="text-xl">Selecciona un pedido de la izquierda para cobrar</p>
                    </div>
                )}
            </div>

            {/* MODAL (Invisible hasta que se invoca) */}
            {pedidoSeleccionado && (
                <ModalCobro
                    isOpen={modalAbierto}
                    onClose={() => setModalAbierto(false)}
                    orderNumber={pedidoSeleccionado.order_number}
                    total={pedidoSeleccionado.amount}
                    onPaymentSuccess={() => {
                        fetchPedidos(); // Recargar lista
                        setPedidoSeleccionado(null); // Limpiar selección
                    }}
                />
            )}
        </div>
    );
};

export default TerminalCaja;