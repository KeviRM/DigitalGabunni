import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { pedidosApi } from '../../api/axiosConfig'; 
import useAuth from "../../hooks/useAuth";
import ModalCobro from "../../components/ModalCobro";
import { FaClock, FaTimes, FaEdit, FaCashRegister, FaCheckCircle } from 'react-icons/fa';
import { useReactToPrint } from 'react-to-print'; // <-- NUEVO
import Ticket from "../../components/Ticket"; // <-- NUEVO (Ajusta la ruta si es necesario)

const TerminalCaja: React.FC = () => {
    const navigate = useNavigate();
    const [pedidos, setPedidos] = useState<any[]>([]);
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState<any | null>(null);
    const [modalAbierto, setModalAbierto] = useState(false);
    const { getAuthHeaders } = useAuth();

    // --- LÓGICA DE IMPRESIÓN (NUEVO) ---
    const ticketRef = useRef<HTMLDivElement>(null);
    
    const handlePrint = useReactToPrint({
        contentRef: ticketRef,
        documentTitle: `Ticket_Gabunni`,
        onAfterPrint: () => {
            // Se ejecuta HASTA QUE la ventana de impresión se cierra
            fetchPedidos();
            setPedidoSeleccionado(null);
            setModalAbierto(false);
        }
    });

    // --- ADAPTADOR PARA EL TICKET (NUEVO) ---
    // El Ticket espera la estructura del carrito, pero aquí tenemos la estructura de la BD.
    // Esto lo traduce automáticamente para no romper el diseño del Ticket.
    const ordenParaTicket = pedidoSeleccionado ? {
        ...pedidoSeleccionado,
        details_snapshot: pedidoSeleccionado.details?.map((d: any) => ({
            cantidad: d.quantity,
            producto: { name: d.product_name, items: d.items }, // items por si es paquete
            precio: d.unit_price,
            personalizacion: d.personalizacion_json
        }))
    } : null;

    // --- FUNCIÓN PARA CANCELAR MANUALMENTE DESDE CAJA ---
    const handleCancelarOrden = async (orderNumber: string) => {
        const confirmar = window.confirm("¿Estás seguro de que deseas cancelar esta orden? Esta acción no se puede deshacer.");
        if (!confirmar) return;

        try {
            await pedidosApi.patch(`/api/v1/pedidos/caja/${orderNumber}/cancelar/`, {}, {
                headers: getAuthHeaders()
            });
            alert("Orden cancelada exitosamente.");
            fetchPedidos(); 
            
            if (pedidoSeleccionado?.order_number === orderNumber) {
                setPedidoSeleccionado(null);
            }
        } catch (error) {
            console.error("Error al cancelar la orden:", error);
            alert("Hubo un error al cancelar la orden. Por favor, intenta de nuevo.");
        }
    };

    // 1. Cargar Pedidos
    const fetchPedidos = async () => {
        try {
            const url = '/api/v1/pedidos/caja/pendientes/';
            const response = await pedidosApi.get(url, { headers: getAuthHeaders() });
            const pendientes = response.data.filter((p: any) => !p.metodo_pago);
            setPedidos(pendientes);
            
            if (pedidoSeleccionado) {
                const actualizado = pendientes.find((p: any) => p.order_number === pedidoSeleccionado.order_number);
                if (actualizado) setPedidoSeleccionado(actualizado);
                else setPedidoSeleccionado(null);
            }
        } catch (error) {
            console.error("Error cargando terminal", error);
        }
    };

    // Polling
    useEffect(() => {
        fetchPedidos();
        const intervalo = setInterval(fetchPedidos, 5000);
        return () => clearInterval(intervalo);
    }, []);

    // Helper de Tiempo
    const calcularTiempo = (fechaIso: string) => {
        const diff = Math.floor((new Date().getTime() - new Date(fechaIso).getTime()) / 60000);
        return diff < 1 ? 'ahora' : `hace ${diff} min`;
    };

   // --- HELPER DE PERSONALIZACIÓN PRO (CAJA / POS) ---
    const renderPersonalizacionPro = (personalizacion: any) => {
        if (!personalizacion || typeof personalizacion !== 'object' || Object.keys(personalizacion).length === 0) return null;

        // 1. Paquetes (Contenido)
        if (personalizacion.Contenido || personalizacion.contenido) {
            const items = personalizacion.Contenido || personalizacion.contenido;
            return (
                <div className="mt-2 ml-2">
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Contenido del Paquete:</p>
                    <div className="flex flex-col space-y-1 border-l-2 border-blue-200 pl-3">
                        {items.map((item: any, i: number) => (
                            <span key={i} className="text-xs text-gray-600 font-medium">
                                {item.quantity || 1}x {item.product_name || item.name}
                            </span>
                        ))}
                    </div>
                </div>
            );
        }

        // 2. Modificaciones (Sin / Extras)
        if (personalizacion.modificaciones) {
            const { extras, sin } = personalizacion.modificaciones;
            return (
                <div className="flex flex-col mt-2 ml-2 space-y-1">
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Modificaciones:</p>
                    {sin && sin.map((ing: any, i: number) => (
                        <span key={`sin-${i}`} className="text-xs text-red-400 line-through font-medium">
                            - Sin {ing.name}
                        </span>
                    ))}
                    {extras && extras.map((ing: any, i: number) => (
                        <span key={`extra-${i}`} className="text-xs text-green-600 font-bold">
                            + {ing.name}
                        </span>
                    ))}
                </div>
            );
        }

        // 3. Chapata Personalizada
        const categorias = Object.keys(personalizacion).filter(k => k !== 'modificaciones' && k !== 'Contenido' && k !== 'contenido');
        if (categorias.length > 0) {
            const todos = categorias.flatMap(k => personalizacion[k]);
            if (todos.length > 0) {
                return (
                    <div className="mt-2 ml-2">
                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Ingredientes:</p>
                        <div className="flex flex-wrap gap-1.5">
                            {todos.map((ing: any, i: number) => (
                                <span key={i} className="text-[11px] font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-md border border-gray-200">
                                    {ing.name}
                                </span>
                            ))}
                        </div>
                    </div>
                );
            }
        }
        return null;
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            
            {/* --- COLUMNA IZQUIERDA --- */}
            <div className="w-1/4 bg-white border-r-4 border-orange-400 flex flex-col z-10 shadow-lg">
                
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-orange-600 font-bold text-lg">Pendientes de Pago</h2>
                    <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-xs font-bold">{pedidos.length}</span>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {pedidos.length === 0 && (
                        <div className="text-center py-10 text-gray-400">
                            <p>No hay pedidos pendientes</p>
                        </div>
                    )}

                    {pedidos.map((pedido) => {
                        const isSelected = pedidoSeleccionado?.order_number === pedido.order_number;
                        return (
                            <div 
                                key={pedido.order_number}
                                onClick={() => setPedidoSeleccionado(pedido)}
                                className={`p-4 rounded-xl cursor-pointer transition-all border-l-4 shadow-sm relative overflow-hidden group
                                    ${isSelected 
                                        ? 'bg-orange-50 border-orange-500 ring-1 ring-orange-200 shadow-md' 
                                        : 'bg-white hover:border-gray-300 hover:bg-gray-50 border border-gray-100'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`text-5xl font-extrabold ${isSelected ? 'text-orange-500' : 'text-gray-300 group-hover:text-gray-400'}`}>
                                        #{pedido.daily_sequence?.toString().padStart(2, '0') || '??'}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-gray-700"></span>
                                            <span className="font-bold text-green-600 text-lg">${parseFloat(pedido.amount).toFixed(0)}</span>
                                        </div>
                                        <div className="flex justify-between items-center mt-1">
                                            <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                                                 <FaClock size={10}/> {calcularTiempo(pedido.created_at)}
                                            </span>
                                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase
                                                ${pedido.type_delivery === 'LLEVAR' ? 'bg-blue-100 text-blue-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                                {pedido.type_delivery === 'LLEVAR' ? 'Para Llevar' : 'Aquí'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* --- DETALLE --- */}
            <div className="flex-1 w-3/4 bg-gray-50 p-10 flex flex-col h-full relative">
                
                {pedidoSeleccionado ? (
                    <div className="flex flex-col h-full max-w-4xl mx-auto w-full pt-10">
                        
                        <div className="text-center mb-8 border-b-2 border-orange-500 pb-4">
                            <h1 className="text-4xl font-extrabold text-gray-800">
                                Detalle de Orden <span className="text-orange-500">#{pedidoSeleccionado.daily_sequence?.toString().padStart(2, '0')}</span>
                            </h1>
                            <p className="text-gray-400 mt-2">{pedidoSeleccionado.client_name || 'Cliente Kiosco'} • {new Date(pedidoSeleccionado.created_at).toLocaleString()}</p>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                            {pedidoSeleccionado.details?.map((detalle: any, idx: number) => (
                                <div key={idx} className="bg-white p-6 rounded-xl border border-orange-200 shadow-md flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-baseline gap-3">
                                            <span className="font-bold text-lg text-gray-500">{detalle.quantity}x</span>
                                            <h3 className="font-bold text-xl text-gray-800">{detalle.product_name}</h3>
                                        </div>
                                        {renderPersonalizacionPro(detalle.personalizacion_json)}
                                    </div>
                                    <div className="text-right">
                                        <span className="font-bold text-xl text-green-600">
                                            ${(detalle.unit_price * detalle.quantity).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 bg-white p-6 rounded-2xl shadow-lg border-4 border-orange-500">
                            <div className="text-center mb-8">
                                <span className="text-gray-400 text-sm font-bold uppercase tracking-widest block mb-1">Total a Pagar</span>
                                <span className="text-6xl font-extrabold text-orange-600">
                                    ${parseFloat(pedidoSeleccionado.amount).toFixed(0)}
                                </span>
                            </div>

                            <div className="grid grid-cols-3 gap-6">
                                <button 
                                    onClick={() => handleCancelarOrden(pedidoSeleccionado.order_number)}
                                    className="py-4 rounded-xl border-2 border-red-500 text-red-500 font-bold text-lg hover:bg-red-200 transition flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <FaTimes /> Cancelar Orden
                                </button>
                                
                                <button 
                                    onClick={() => navigate(`/caja/nueva-orden`, {state: {PedidoEditar: pedidoSeleccionado}})}
                                    className="py-4 rounded-xl border-2 border-gray-500 text-gray-600 font-bold text-lg hover:bg-gray-300 transition flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <FaEdit /> Editar Orden
                                </button>
                                
                                <button 
                                    onClick={() => setModalAbierto(true)}
                                    className="py-4 rounded-xl bg-green-600 text-white font-bold text-lg hover:bg-green-700 shadow-lg shadow-green-200 transition flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <FaCheckCircle /> CONFIRMAR PAGO
                                </button>
                            </div>
                        </div>

                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-300">
                        <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                            <FaCashRegister className="text-9xl text-gray-400" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-400">Selecciona un pedido</h2>
                        <p className="mt-2">Elige una orden de la lista para ver el detalle y cobrar.</p>
                    </div>
                )}
            </div>

            {/* --- COMPONENTE OCULTO DEL TICKET (NUEVO) --- */}
            <div style={{ display: 'none' }}>
                <Ticket ref={ticketRef} orden={ordenParaTicket} />
            </div>

            {/* MODAL COBRO */}
            {pedidoSeleccionado && (
                <ModalCobro
                    isOpen={modalAbierto}
                    onClose={() => setModalAbierto(false)}
                    orderNumber={pedidoSeleccionado.order_number}
                    daily_sequence={pedidoSeleccionado.daily_sequence?.toString().padStart(2, '0') }
                    total={pedidoSeleccionado.amount}
                    onPaymentSuccess={() => {
                        // AQUÍ YA NO LIMPIAMOS LOS DATOS.
                        // Solo lanzamos la alerta y abrimos la ventana de impresión.
                        alert(`¡Orden #${pedidoSeleccionado.daily_sequence} cobrada con éxito!`);
                        handlePrint();
                    }}
                />
            )}
        </div>
    );
};

export default TerminalCaja;