import React from 'react';
import { FaTimes, FaShoppingCart, FaBoxOpen } from 'react-icons/fa';
import type { Paquete } from '../../types/menu';

interface ModalDetallePaqueteProps {
    paquete: Paquete;
    onClose: () => void;
    onAddToCart: (paquete: Paquete) => void;
}

const ModalDetallePaquete: React.FC<ModalDetallePaqueteProps> = ({ paquete, onClose, onAddToCart }) => {
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative animate-scale-up">

                {/* Botón Cerrar */}
                <button onClick={onClose} className="absolute top-4 right-4 z-30 bg-gray-100 text-gray-500 hover:bg-red-500 hover:text-white p-2 rounded-full transition-all shadow-sm">
                    <FaTimes size={20} />
                </button>

                {/* COLUMNA IZQUIERDA: IMAGEN */}
                <div className="w-full md:w-1/2 bg-blue-50 flex items-center justify-center p-8 relative">
                    <div className="absolute top-6 left-6 bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-sm uppercase tracking-wider flex items-center gap-2">
                        <FaBoxOpen /> PAQUETE
                    </div>
                    <img
                        src={paquete.image || 'https://via.placeholder.com/400'}
                        alt={paquete.name}
                        className="w-full h-64 md:h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                    />
                </div>

                {/* COLUMNA DERECHA: CONTENIDO */}
                <div className="w-full md:w-1/2 p-10 flex flex-col bg-white">
                    
                    <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                            <h2 className="text-3xl font-extrabold text-gray-800 leading-tight">{paquete.name}</h2>
                            <span className="text-2xl font-black text-green-600">${parseFloat(paquete.price).toFixed(2)}</span>
                        </div>
                        
                        <p className="text-gray-500 text-sm mb-6">{paquete.description}</p>

                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">
                                Contenido del Paquete:
                            </h3>
                            <ul className="space-y-3">
                                {paquete.items.map((item, index) => (
                                    <li key={index} className="flex items-center gap-3">
                                        <span className="bg-blue-100 text-blue-700 font-bold w-8 h-8 flex items-center justify-center rounded-lg text-sm">
                                            {item.quantity}x
                                        </span>
                                        <span className="text-gray-700 font-bold text-lg">
                                            {item.product_name}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* BOTÓN AGREGAR */}
                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <button
                            onClick={() => onAddToCart(paquete)}
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-lg"
                        >
                            <FaShoppingCart />
                            <span>Agregar Paquete</span>
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ModalDetallePaquete;