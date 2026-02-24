import React, { useState, useEffect, useMemo } from 'react';
import type { Producto, ClaseIngrediente, Ingrediente } from '../../types/menu';
// Ajusta esta ruta según dónde tengas tus peticiones a la API
import { fetchClasesIngredientes } from '../../api/menuApi'; 
import { FaTimes, FaCheck } from 'react-icons/fa';

interface ModalPersonalizadorPOSProps {
    onClose: () => void;
    // Esta es la clave: le pasamos la orden armada de regreso al Punto de Venta
    onAddToCart: (producto: Producto, cantidad: number, personalizacion: any) => void;
}

interface Selecciones {
    [claseId: number]: Ingrediente[];
}

const ModalPersonalizadorPOS: React.FC<ModalPersonalizadorPOSProps> = ({ onClose, onAddToCart }) => {

    const [clases, setClases] = useState<ClaseIngrediente[]>([]);
    const [selecciones, setSelecciones] = useState<Selecciones>({});

    // Producto Base (El "Lienzo en blanco")
    const productoBase: Producto = {
        id: Date.now(), // ID temporal para identificar que es personalizada
        name: "Chapata Personalizada",
        description: "Arma tu chapata eligiendo cada ingrediente.",
        price: "0.00",
        image: null,
        category: 1, // ID de la categoría Chapatas en tu BD
        category_name: "Chapatas",
        is_active: true,
        receta: [] as any
    };

    // Carga inicial de datos
    useEffect(() => {
        fetchClasesIngredientes().then(setClases);
    }, []);

    // Cálculo de precio dinámico
    const precioTotal = useMemo(() => {
        let costoAdicional = 0;
        Object.values(selecciones).forEach(ingredientes => {
            ingredientes.forEach((ing: Ingrediente) => {
                costoAdicional += parseFloat(ing.additional_price || "0");
            });
        });
        return costoAdicional;
    }, [selecciones]);

    // Validación
    const isFormValid = useMemo(() => {
        return clases.every(clase => {
            if (clase.required) {
                const seleccion = selecciones[clase.id];
                return seleccion && seleccion.length > 0;
            }
            return true;
        });
    }, [clases, selecciones]);

    // Manejo de Selección
    const handleToggleIngrediente = (claseId: number, ingrediente: Ingrediente) => {
        setSelecciones(prev => {
            const currentList = prev[claseId] || [];
            const exists = currentList.find(i => i.id === ingrediente.id);
            const claseInfo = clases.find(c => c.id === claseId);
            const esSeleccionUnica = claseInfo?.single_selection;

            if (esSeleccionUnica) {
                if (exists) {
                    return { ...prev, [claseId]: [] };
                } else {
                    return { ...prev, [claseId]: [ingrediente] };
                }
            } else {
                let newList;
                if (exists) {
                    newList = currentList.filter(i => i.id !== ingrediente.id);
                } else {
                    newList = [...currentList, ingrediente];
                }
                return { ...prev, [claseId]: newList };
            }
        });
    };

    const handleConfirmarPedido = () => {
        if (isFormValid) {
            // Emulamos un producto normal pero con el precio total calculado
            const productoParaCarrito = {
                ...productoBase,
                price: precioTotal.toString(),
                name: "Chapata a tu Gusto"
            };

            // Lo enviamos a la función del Punto de Venta
            onAddToCart(productoParaCarrito, 1, selecciones);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white w-full max-w-5xl h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col relative animate-scale-up">

                {/* Header */}
                <div className="bg-orange-500 p-6 flex justify-between items-center text-white shadow-md z-10">
                    <h2 className="text-3xl font-extrabold flex items-center gap-3">
                        <span className='bg-white text-orange-500 rounded-full w-10 h-10 flex items-center justify-center text-xl shadow-sm'>🥖</span>
                        Armar Chapata Nueva
                    </h2>
                    <button onClick={onClose} className="bg-white/20 hover:bg-white/40 p-3 rounded-full transition-colors backdrop-blur-md">
                        <FaTimes size={24} />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Columna Izquierda: Ingredientes (Scrollable) */}
                    <div className="w-full md:w-2/3 overflow-y-auto p-8 bg-gray-50 custom-scrollbar">
                        {clases.map(clase => (
                            <div key={clase.id} className="mb-10 animate-slide-in-right" style={{ animationDelay: `${clase.id * 50}ms` }}>
                                <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3 border-b border-gray-200 pb-2">
                                    {clase.name}
                                    {clase.required && <span className="bg-red-100 text-red-500 text-xs px-2 py-1 rounded-full uppercase tracking-wider">Obligatorio</span>}
                                    {clase.single_selection && <span className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full uppercase tracking-wider">Elige 1</span>}
                                </h3>

                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                    {clase.ingredientes.map(ingrediente => {
                                        const isAgotado = !ingrediente.available;
                                        const isSelected = selecciones[clase.id]?.some(i => i.id === ingrediente.id);
                                        return (
                                            <button
                                                key={ingrediente.id}
                                                disabled={isAgotado}
                                                onClick={() => handleToggleIngrediente(clase.id, ingrediente)}
                                                className={`relative p-4 rounded-2xl border-2 transition-all duration-200 flex flex-col items-start gap-2 h-full text-left group
                                                    ${isAgotado
                                                        ? 'bg-gray-100 border-gray-200 opacity-50 grayscale cursor-not-allowed'
                                                        : isSelected
                                                            ? 'bg-orange-50 border-orange-500 shadow-orange-100 shadow-lg transform scale-[1.02]'
                                                            : 'bg-white border-gray-100 hover:border-orange-200 hover:shadow-md'
                                                    }`}
                                            >
                                                <div className="flex justify-between w-full items-start">
                                                    <span className={`font-bold text-lg leading-tight ${isSelected ? 'text-orange-700' : 'text-gray-700'}`}>
                                                        {ingrediente.name}
                                                    </span>
                                                    {isSelected && <div className="bg-orange-500 text-white rounded-full p-1"><FaCheck size={10} /></div>}
                                                </div>

                                                {Number(ingrediente.additional_price) > 0 && (
                                                    <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-lg">
                                                        +${ingrediente.additional_price}
                                                    </span>
                                                )}

                                                {isAgotado && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200/50 backdrop-blur-[1px] rounded-2xl">
                                                        <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg transform -rotate-12">AGOTADO</span>
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Columna Derecha: Resumen (Sticky) */}
                    <div className="w-full md:w-1/3 bg-white border-l border-gray-200 flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.05)] z-20">
                        <div className="p-8 flex-1 flex flex-col justify-center items-center text-center">
                            <img
                                src="https://i.pinimg.com/originals/fb/1a/3b/fb1a3bfd4fb96c76d9f877b57259b345.jpg"
                                alt="Referencia"
                                className="w-48 h-48 object-cover rounded-full shadow-2xl mb-6 border-4 border-orange-100"
                            />
                            <h3 className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-2">Total Estimado</h3>
                            <div className="text-6xl font-black text-gray-800 mb-8 tracking-tighter">
                                ${precioTotal.toFixed(2)}
                            </div>

                            {!isFormValid && (
                                <p className="text-red-500 text-sm mb-4 bg-red-50 px-4 py-2 rounded-lg border border-red-100 animate-pulse">
                                    Selecciona todos los obligatorios
                                </p>
                            )}

                            <button
                                onClick={handleConfirmarPedido}
                                disabled={!isFormValid}
                                className={`w-full py-5 rounded-2xl font-black text-xl shadow-xl transition-all transform active:scale-95
                                    ${isFormValid
                                        ? 'bg-linear-to-r from-orange-500 to-orange-600 text-white hover:shadow-orange-300 hover:-translate-y-1'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                {isFormValid ? '¡Agregar al Ticket!' : 'Completa tu chapata'}
                            </button>

                            <button onClick={onClose} className="mt-4 text-gray-400 hover:text-gray-600 font-bold text-sm">
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModalPersonalizadorPOS;