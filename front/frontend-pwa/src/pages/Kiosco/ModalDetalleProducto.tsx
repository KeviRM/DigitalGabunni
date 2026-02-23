import React, { useState, useEffect } from 'react';
import { FaTimes, FaMinus, FaPlus, FaShoppingCart, FaCheckCircle, FaRegCircle, FaArrowLeft, FaLock } from 'react-icons/fa';
import type { Producto } from '../../types/menu';

interface ModalDetalleProductoProps {
    producto: Producto;
    onClose: () => void;
    onAddToCart: (producto: Producto, cantidad: number, personalizacion?: any) => void; 
}

const ModalDetalleProducto: React.FC<ModalDetalleProductoProps> = ({ producto, onClose, onAddToCart }) => {
    const [cantidad, setCantidad] = useState(1);
    const [isCustomizing, setIsCustomizing] = useState(false);

    // --- 1. DATOS REALES DESDE EL BACKEND ---
    const recetaOriginal = producto.receta || [];
    
    // Mapeamos la receta respetando la regla is_removable
    const ingredientesBase = recetaOriginal.map((item: any, index: number) => ({
        id: item.ingredient || index,
        name: item.ingrediente_name || item.name || 'Ingrediente',
        is_removable: item.is_removable !== false, // Si no viene, asumimos que sí se puede quitar (True)
        price: 0
    }));

    // Usamos la lista de extras que mande el backend (Si no viene, arreglo vacío)
    const extrasDisponibles = producto.extras_disponibles || [];

    // --- 2. ESTADOS DE SELECCIÓN ---
    const [baseActivos, setBaseActivos] = useState<number[]>(ingredientesBase.map(i => i.id)); 
    const [extrasSeleccionados, setExtrasSeleccionados] = useState<any[]>([]);

    // --- MANEJADORES ---
    const handleIncrement = () => setCantidad(prev => prev + 1);
    const handleDecrement = () => setCantidad(prev => (prev > 1 ? prev - 1 : 1));

    const toggleBase = (ing: any) => {
        // Validación de seguridad extra: Si no es removible, no hace nada
        if (!ing.is_removable) return; 
        
        setBaseActivos(prev => prev.includes(ing.id) ? prev.filter(i => i !== ing.id) : [...prev, ing.id]);
    };

    const toggleExtra = (extra: any) => {
        setExtrasSeleccionados(prev => {
            const existe = prev.find((e: any) => e.id === extra.id);
            if (existe) return prev.filter((e: any) => e.id !== extra.id);
            return [...prev, extra];
        });
    };

    // --- CÁLCULOS DE PRECIO ---
    const precioUnitarioBase = parseFloat(producto.price);
    // Aseguramos que el precio del extra se lea de additional_price o price según venga de tu API
    const costoExtras = extrasSeleccionados.reduce((sum, item) => sum + parseFloat(item.additional_price || item.price || 0), 0);
    const precioUnitarioFinal = precioUnitarioBase + costoExtras;
    const precioTotal = precioUnitarioFinal * cantidad;

    // --- CONFIRMAR Y ENVIAR ---
    const handleAdd = () => {
        const eliminados = ingredientesBase.filter(ing => !baseActivos.includes(ing.id));
        
        let personalizacionJSON = null;
        if (eliminados.length > 0 || extrasSeleccionados.length > 0) {
            personalizacionJSON = {
                modificaciones: {
                    extras: extrasSeleccionados,
                    sin: eliminados
                }
            };
        }
        onAddToCart(producto, cantidad, personalizacionJSON);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white w-full max-w-5xl h-[85vh] rounded-4xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative">

                {/* Botón Cerrar */}
                <button onClick={onClose} className="absolute top-5 right-5 z-30 bg-orange-100 text-orange-500 hover:bg-red-500 hover:text-white p-2 rounded-full transition-all shadow-sm">
                    <FaTimes size={20} />
                </button>

                {/* === COLUMNA IZQUIERDA: IMAGEN Y PRECIO BASE === */}
                <div className="w-full md:w-5/12 bg-[#FFFBF7] flex flex-col items-center justify-center p-8 relative">
                    <img
                        src={producto.image || 'https://via.placeholder.com/400'}
                        alt={producto.name}
                        className="w-full h-auto max-h-[350px] object-contain drop-shadow-xl hover:scale-105 transition-transform duration-500"
                    />
                    <div className="mt-8 bg-white border border-orange-100 shadow-sm px-6 py-2 rounded-full flex items-center gap-2">
                        <span className="text-gray-400 text-xs font-bold uppercase tracking-wide">PRECIO BASE</span>
                        <span className="text-xl font-black text-orange-500">${precioUnitarioBase.toFixed(2)}</span>
                    </div>
                </div>

                {/* === COLUMNA DERECHA: INFO Y CONTROLES === */}
                <div className="w-full md:w-7/12 flex flex-col h-full bg-white px-10 py-8 relative">
                    
                    {/* CABECERA Y CANTIDAD... (Se mantiene igual que la versión anterior) */}
                    <div className="mb-4 flex justify-between items-start mt-7">
                        <div>
                            <h2 className="text-4xl font-extrabold text-gray-800 leading-tight mb-1">{producto.name}</h2>
                            <p className="text-gray-400 text-sm font-medium mb-4">{producto.category_name || 'Producto'}</p>
                            <p className="text-gray-500 text-md font-medium">{producto.description || 'Producto'}</p>
                        </div>
                        <div className="text-right">
                             <span className="text-2xl font-bold text-green-600">${precioUnitarioFinal.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between border-b border-dashed border-gray-200 pb-6 mb-6">
                        <div className="flex items-center gap-6">
                            <span className="font-bold text-gray-800 text-lg">Cantidad:</span>
                            <div className="flex items-center gap-3">
                                <button onClick={handleDecrement} className="w-10 h-10 rounded-full border-2 border-orange-400 text-orange-500 flex items-center justify-center hover:bg-orange-50 transition active:scale-95"><FaMinus size={14}/></button>
                                <div className="w-14 h-10 border-2 border-orange-200 rounded-lg flex items-center justify-center text-xl font-bold text-gray-700">{cantidad}</div>
                                <button onClick={handleIncrement} className="w-10 h-10 rounded-full border-2 border-orange-400 text-orange-500 flex items-center justify-center hover:bg-orange-50 transition active:scale-95"><FaPlus size={14}/></button>
                            </div>
                        </div>
                        <div className="bg-green-50 text-green-600 px-4 py-2 rounded-lg font-black text-2xl shadow-sm">
                            ${precioTotal.toFixed(2)}
                        </div>
                    </div>

                    {/* ZONA DE LISTAS */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                        {!isCustomizing ? (
                            <div className="animate-fade-in h-full flex flex-col">
                                <h3 className="text-lg font-extrabold text-gray-800 mb-4">Ingredientes:</h3>
                                {ingredientesBase.length > 0 ? (
                                    <ul className="space-y-3 mb-8">
                                        {ingredientesBase.map((ing, i) => (
                                            <li key={i} className="flex items-center gap-3 text-gray-600 font-medium">
                                                <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0"></span>
                                                {ing.name}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-400 italic mb-8">No hay información de ingredientes.</p>
                                )}
                                
                                {/* Ocultamos el prompt si no hay nada que personalizar */}
                                {(ingredientesBase.some(ing => ing.is_removable) || extrasDisponibles.length > 0) && (
                                    <div className="mt-auto mb-4 text-center">
                                        <p className="text-gray-400 text-sm italic">
                                            ¿Quieres agregar extras o quitar ingredientes? <br/>
                                            Dale clic en <span className="font-bold text-orange-400">"Personalizar"</span>.
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="animate-fade-in space-y-6">
                                {/* SECCIÓN QUITAR (RESTRINGIDA) */}
                                <div>
                                    <h3 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide">Ingredientes Base</h3>
                                    <div className="grid grid-cols-1 gap-2">
                                        {ingredientesBase.map((ing) => {
                                            const activo = baseActivos.includes(ing.id);
                                            const bloqueado = !ing.is_removable;

                                            return (
                                                <button 
                                                    key={ing.id} 
                                                    onClick={() => toggleBase(ing)} 
                                                    disabled={bloqueado}
                                                    className={`flex justify-between items-center px-4 py-3 rounded-xl border transition-all 
                                                        ${bloqueado ? 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-80' : 
                                                          activo ? 'border-gray-400 bg-white hover:border-red-200' : 'border-red-300 bg-red-50'}`}
                                                >
                                                    <span className={`font-medium ${bloqueado ? 'text-gray-500' : activo ? 'text-gray-700' : 'text-red-500 line-through'}`}>
                                                        {ing.name}
                                                    </span>
                                                    
                                                    {bloqueado ? (
                                                        <FaLock className="text-gray-500"/>
                                                    ) : activo ? (
                                                        <FaCheckCircle className="text-green-500"/>
                                                    ) : (
                                                        <FaRegCircle className="text-gray-300"/>
                                                    )}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* SECCIÓN EXTRAS DINÁMICOS */}
                                {extrasDisponibles.length > 0 && (
                                    <div>
                                        <h3 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide">Extras ($$$)</h3>
                                        <div className="grid grid-cols-1 gap-2">
                                            {extrasDisponibles.map((extra) => {
                                                const sel = extrasSeleccionados.some((e: any) => e.id === extra.id);
                                                // Asumimos que tu backend puede mandar el precio como 'additional_price' o 'price'
                                                const extraPrice = parseFloat(extra.additional_price || extra.price || 0).toFixed(2);
                                                
                                                return (
                                                    <button key={extra.id} onClick={() => toggleExtra(extra)} className={`flex justify-between items-center px-4 py-3 rounded-xl border transition-all ${sel ? 'border-orange-500 bg-orange-50 shadow-sm' : 'border-dashed border-gray-300 hover:border-orange-300'}`}>
                                                        <div className="flex items-center gap-3">
                                                            {sel ? <FaCheckCircle className="text-orange-500"/> : <FaPlus className="text-gray-300"/>}
                                                            <span className={`font-bold ${sel ? 'text-orange-700' : 'text-gray-500'}`}>{extra.name}</span>
                                                        </div>
                                                        <span className="font-bold text-orange-600">+${extraPrice}</span>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* FOOTER BOTONES */}
                    <div className="mt-4 grid gap-3 pt-4 border-t border-gray-100">
                        {!isCustomizing ? (
                            <>
                                <button onClick={handleAdd} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-extrabold py-4 rounded-xl shadow-lg shadow-orange-200 transition-transform active:scale-[0.98] text-xl">
                                    Agregar al pedido
                                </button>
                                {/* Solo mostramos el botón si hay algo que modificar o extras disponibles */}
                                {(ingredientesBase.some(ing => ing.is_removable) || extrasDisponibles.length > 0) && (
                                    <button onClick={() => setIsCustomizing(true)} className="w-full bg-white border-2 border-orange-500 text-orange-500 font-bold py-3 rounded-xl hover:bg-orange-50 transition-colors text-lg">
                                        Personalizar
                                    </button>
                                )}
                            </>
                        ) : (
                            <>
                                <button onClick={handleAdd} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-extrabold py-4 rounded-xl shadow-lg shadow-orange-200 transition-transform active:scale-[0.98] text-xl flex items-center justify-center gap-2">
                                    <FaCheckCircle /> Guardar Cambios
                                </button>
                                <button onClick={() => setIsCustomizing(false)} className="w-full bg-gray-100 text-gray-500 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                                    <FaArrowLeft /> Cancelar
                                </button>
                            </>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ModalDetalleProducto;