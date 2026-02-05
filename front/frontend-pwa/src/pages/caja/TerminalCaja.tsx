import React, { useState, useEffect } from "react";
import { pedidosApi } from '../../api/axiosConfig'; 
import useAuth from "../../hooks/useAuth";
import ModalCobro from "../../components/ModalCobro"; // Tu componente estrella

const TerminalCaja = () => {
    const [pedidos, setPedidos] = useState([]);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [pedidoA_Cobrar, setPedidoA_Cobrar] = useState<any>(null);
    const { getAuthHeaders } = useAuth();

    // Traer pedidos NO pagados
    const fetchPedidosCobro = async () => {
        try {
            // Filtramos por estados válidos. Ajusta según tu flujo.
            const url = '/api/v1/pedidos/gestion/?status=CONFIRMADO&status=PREPARACION&status=LISTO';
            const response = await pedidosApi.get(url, { headers: getAuthHeaders() });
            
            // Filtro extra en frontend: Solo los que NO tienen metodo_pago
            const pendientes = response.data.filter((p: any) => !p.metodo_pago);
            setPedidos(pendientes);
        } catch (error) {
            console.error("Error cargando terminal", error);
        }
    };

    useEffect(() => { fetchPedidosCobro(); }, []);

    const handleCobrar = (pedido: any) => {
        setPedidoA_Cobrar({ id: pedido.order_number, total: pedido.amount });
        setModalAbierto(true);
    };

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-extrabold text-gray-800">Terminal de Cobro <span className="text-green-600">$$$</span></h2>
                <button onClick={fetchPedidosCobro} className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-bold hover:bg-blue-200">
                     Actualizar
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pedidos.length === 0 && (
                    <div className="col-span-full text-center py-20 bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-300">
                        <p className="text-gray-400 text-xl font-bold"> Todo cobrado. No hay pedidos pendientes.</p>
                    </div>
                )}

                {pedidos.map((pedido: any) => (
                    <div key={pedido.order_number} className="bg-white rounded-xl shadow-lg border-l-8 border-green-500 overflow-hidden hover:shadow-xl transition-shadow">
                        <div className="p-5">
                            <div className="flex justify-between mb-2">
                                <span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold text-gray-600">#{pedido.order_number.substring(0,6)}</span>
                                <span className="text-xs font-bold text-orange-600 uppercase tracking-wide">{pedido.type_delivery}</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">{pedido.client_name || "Cliente Mostrador"}</h3>
                            <p className="text-gray-500 text-sm mb-4">Tel: {pedido.phone_number}</p>
                            
                            <div className="bg-gray-50 p-3 rounded-lg mb-4 h-32 overflow-y-auto custom-scrollbar">
                                {pedido.details.map((d: any, i: number) => (
                                    <div key={i} className="flex justify-between text-sm border-b border-gray-100 last:border-0 py-1">
                                        <span className="font-medium text-gray-700">{d.quantity}x {d.product_name}</span>
                                        <span className="text-gray-900 font-bold">${d.unit_price}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center justify-between mt-2">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Total a Cobrar</p>
                                    <p className="text-3xl font-extrabold text-gray-900">${parseFloat(pedido.amount).toFixed(2)}</p>
                                </div>
                                <button 
                                    onClick={() => handleCobrar(pedido)}
                                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg transform active:scale-95 transition-all flex items-center"
                                >
                                    COBRAR 
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {pedidoA_Cobrar && (
                <ModalCobro
                    isOpen={modalAbierto}
                    onClose={() => setModalAbierto(false)}
                    orderNumber={pedidoA_Cobrar.id}
                    total={pedidoA_Cobrar.total}
                    onPaymentSuccess={() => {
                        fetchPedidosCobro();
                        // Opcional: Aquí podrías disparar la impresión del ticket
                    }}
                />
            )}
        </div>
    );
};

export default TerminalCaja;