// frontend-pwa/src/pages/PedidoExito.tsx
import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';
import { useCarrito } from '../context/CarritoContext';

const PedidoExito: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { limpiarCarrito } = useCarrito();
    
    const paymentId = searchParams.get('payment_id');
    const status = searchParams.get('status');
    const externalReference = searchParams.get('external_reference'); // Nuestro numero_pedido

    useEffect(() => {
        limpiarCarrito(); // Asegurar que el carrito se vacíe al llegar aquí
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-lg">
                <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-6" />
                <h1 className="text-3xl font-extrabold text-gray-800 mb-4">¡Pago Exitoso!</h1>
                <p className="text-gray-600 mb-6">
                    Tu pedido ha sido confirmado y enviado a cocina.
                </p>
                
                <div className="bg-gray-100 p-4 rounded-lg text-left mb-8 text-sm">
                    <p><strong>Referencia de Pago:</strong> {paymentId}</p>
                    <p><strong>Estado:</strong> {status}</p>
                    <p><strong>Pedido ID:</strong> #{externalReference?.substring(0, 8)}</p>
                </div>

                <button 
                    onClick={() => navigate(`/pedido/estado/${externalReference}`)}
                    className="w-full py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600"
                >
                    Ver Estado del Pedido
                </button>
            </div>
        </div>
    );
};

export default PedidoExito;