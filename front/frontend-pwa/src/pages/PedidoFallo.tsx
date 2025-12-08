// src/pages/PedidoFallo.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTimesCircle, FaArrowLeft } from 'react-icons/fa';

const PedidoFallo: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-6">
            <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-lg w-full">
                <FaTimesCircle className="text-6xl text-red-500 mx-auto mb-6" />
                <h1 className="text-3xl font-extrabold text-gray-800 mb-4">¡Algo salió mal!</h1>
                <p className="text-gray-600 mb-8">
                    No pudimos procesar tu pago. Puede que haya fondos insuficientes o que la tarjeta haya sido rechazada.
                    <br/><br/>
                    No te preocupes, no se te ha cobrado nada.
                </p>

                <div className="space-y-3">
                    <button 
                        onClick={() => navigate('/checkout')}
                        className="w-full py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors shadow-md"
                    >
                        Intentar Pagar de Nuevo
                    </button>
                    
                    <button 
                        onClick={() => navigate('/menu')}
                        className="w-full py-3 bg-white text-gray-700 border border-gray-300 font-bold rounded-lg hover:bg-gray-50 flex items-center justify-center"
                    >
                        <FaArrowLeft className="mr-2" /> Volver al Menú
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PedidoFallo;