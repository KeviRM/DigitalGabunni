// src/pages/PedidoPendiente.tsx
import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FaClock, FaStore } from 'react-icons/fa';

const PedidoPendiente: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const externalReference = searchParams.get('external_reference'); // ID del pedido

    return (
        <div className="min-h-screen bg-yellow-50 flex items-center justify-center p-6">
            <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-lg w-full">
                <FaClock className="text-6xl text-yellow-500 mx-auto mb-6" />
                <h1 className="text-3xl font-extrabold text-gray-800 mb-4">Pago en Proceso</h1>
                <p className="text-gray-600 mb-6">
                    Tu pago se está procesando. Si elegiste pago en efectivo, recuerda realizar el depósito pronto.
                    <br/>
                    Tu pedido se confirmará automáticamente en cuanto recibamos el pago.
                </p>

                {externalReference && (
                    <div className="bg-gray-100 p-4 rounded-lg mb-8 text-sm">
                         <p><strong>Referencia de Pedido:</strong> #{externalReference.substring(0,8)}</p>
                    </div>
                )}

                <button 
                    onClick={() => navigate(externalReference ? `/pedido/estado/${externalReference}` : '/menu')}
                    className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 flex items-center justify-center"
                >
                    <FaStore className="mr-2" /> Ver Estado del Pedido
                </button>
            </div>
        </div>
    );
};

export default PedidoPendiente;