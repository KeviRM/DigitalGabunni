import React, { useState } from 'react';
import { FaTimes, FaMinus, FaPlus, FaShoppingCart, FaUtensils } from 'react-icons/fa';
import type { Producto } from '../../types/menu';

interface ModalDetalleProductoProps {
    producto: Producto;
    onClose: () => void;
    onAddToCart: (producto: Producto, cantidad: number) => void;
    onPersonalizar: (producto: Producto) => void;
}

const ModalDetalleProducto: React.FC<ModalDetalleProductoProps> = ({ producto, onClose, onAddToCart, onPersonalizar }) => {
    const [cantidad, setCantidad] = useState(1);
    const precioUnitario = parseFloat(producto.price);

    const handleIncrement = () => setCantidad(prev => prev + 1);
    const handleDecrement = () => setCantidad(prev => (prev > 1 ? prev - 1 : 1));

    const precioTotal = precioUnitario * cantidad;

    // TODO: Ajustar según la estructura real de tu objeto receta
    // Asumimos que receta es un array de objetos con ingredient_name o similar
    const ingredientes = producto.receta || [];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative animate-scale-up">

                {/* Botón Cerrar (Absoluto) */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-30 bg-white/80 backdrop-blur p-2 rounded-full text-gray-500 hover:text-red-500 hover:bg-white shadow-sm transition-all"
                >
                    <FaTimes size={24} />
                </button>

                {/* Columna Izquierda: Imagen */}
                <div className="w-full md:w-1/2 bg-gray-50 flex items-center justify-center p-8 relative overflow-hidden">
                    {/* Badge de Categoría */}
                    <div className="absolute top-6 left-6 bg-white/90 backdrop-blur px-4 py-1.5 rounded-full text-xs font-bold text-gray-500 shadow-sm border border-gray-100 uppercase tracking-wider">
                        {producto.category_name}
                    </div>

                    <img
                        src={producto.image || 'https://via.placeholder.com/400'}
                        alt={producto.name}
                        className="w-full h-64 md:h-full object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500 select-none"
                    />
                </div>

                {/* Columna Derecha: Información y Controles */}
                <div className="w-full md:w-1/2 p-8 flex flex-col h-full overflow-y-auto custom-scrollbar">

                    <div className="flex-1">
                        <div className="flex justify-between items-start mb-4 gap-4">
                            <h2 className="text-3xl font-extrabold text-gray-800 leading-tight">{producto.name}</h2>
                            <span className="text-2xl font-black text-orange-600 bg-orange-50 px-3 py-1 rounded-xl whitespace-nowrap">
                                ${precioUnitario.toFixed(2)}
                            </span>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Descripción</h3>
                            <p className="text-gray-600 leading-relaxed text-sm font-medium">
                                {producto.description}
                            </p>
                        </div>

                        {/* Lista de Ingredientes (Si existen) */}
                        {ingredientes.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                                    Ingredientes
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {ingredientes.map((item, index) => (
                                        <span key={index} className="bg-orange-50 text-orange-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-orange-100 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
                                            {item.ingrediente_name || `Ingrediente ${index + 1}`}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer: Controles */}
                    <div className="mt-4 pt-6 border-t border-gray-100">

                        {/* Selector de Cantidad */}
                        <div className="flex items-center justify-between mb-6">
                            <span className="text-gray-400 font-bold text-sm uppercase tracking-wider">Cantidad</span>

                            <div className="flex items-center bg-gray-100 rounded-2xl p-1 gap-4">
                                <button
                                    onClick={handleDecrement}
                                    className="w-10 h-10 rounded-xl bg-white text-gray-500 shadow-sm flex items-center justify-center hover:text-orange-600 hover:shadow-md transition-all active:scale-95"
                                >
                                    <FaMinus size={12} />
                                </button>
                                <span className="text-2xl font-bold text-gray-800 w-8 text-center">{cantidad}</span>
                                <button
                                    onClick={handleIncrement}
                                    className="w-10 h-10 rounded-xl bg-white text-gray-500 shadow-sm flex items-center justify-center hover:text-orange-600 hover:shadow-md transition-all active:scale-95"
                                >
                                    <FaPlus size={12} />
                                </button>
                            </div>
                        </div>

                        {/* Botones de Acción */}
                        <div className="space-y-3">
                            <button
                                onClick={() => onAddToCart(producto, cantidad)}
                                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all transform active:scale-[0.98] flex items-center justify-center gap-3 text-lg"
                            >
                                <FaShoppingCart />
                                <span>Agregar ${precioTotal.toFixed(2)}</span>
                            </button>

                            {/* Solo mostrar personalizar si la categoría lo amerita (ej. Chapatas id=1), o siempre mostrar si es configurable */}
                            {producto.category === 1 && (
                                <button
                                    onClick={() => onPersonalizar(producto)}
                                    className="w-full bg-white border-2 border-orange-100 hover:border-orange-300 text-orange-500 hover:text-orange-600 font-bold py-3 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    <FaUtensils />
                                    Personalizar a mi gusto
                                </button>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ModalDetalleProducto;
