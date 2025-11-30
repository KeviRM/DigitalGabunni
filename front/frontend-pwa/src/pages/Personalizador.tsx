// frontend-pwa/src/pages/Personalizador.tsx (Lógica esencial)
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type{ Producto, ClaseIngrediente, Ingrediente, ItemCarrito } from '../types/menu';
import { fetchClasesIngredientes } from '../api/menuApi';
import { useCarrito } from '../context/CarritoContext';
import { FaCheck } from 'react-icons/fa';

interface Selecciones {
    [claseId: number]: Ingrediente[]; 
}

const Personalizador: React.FC = () => {
    
    const navigate = useNavigate();
    const { agregarItem } = useCarrito();

    const [clases, setClases] = useState<ClaseIngrediente[]>([]);
    const [selecciones, setSelecciones] = useState<Selecciones>({});
    


    const productoBase: Producto = {
        id: 0, 
        name: "Chapata Personalizada", 
        description: "Arma tu chapata eligiendo cada ingrediente.", 
        price: "0.00", 
        image: null, 
        category: 1, 
        category_name: "Chapatas", 
        is_active: true, 
        receta: [] as any
    };






    // Carga inicial de datos
    useEffect(() => {
        // Cargar las opciones de personalización (Pan, Proteína, etc.)
        fetchClasesIngredientes().then(setClases);

        
    } , []);

    const precioBase = productoBase ? parseFloat(productoBase.price) : 0;

    // --- Lógica de Cálculo de Precio en Tiempo Real (Mueve la lógica de DetalleProducto aquí) ---
    const precioTotal = useMemo(() => {
        let costoAdicional = 0;
        Object.values(selecciones).forEach(ingredientes => {
            ingredientes.forEach(ing => {
                costoAdicional += parseFloat(ing.additional_price);
            });
        });
        return precioBase + costoAdicional;
    }, [selecciones, precioBase]);

    // --- Lógica de Validación (Mueve la lógica de DetalleProducto aquí) ---
    const isFormValid = useMemo(() => {
        // ... (Lógica para validar que los requeridos tengan al menos 1 selección)
        return clases.every(clase => {
            if (clase.required) {
                const seleccion = selecciones[clase.id];
                return seleccion && seleccion.length > 0;
            }
            return true;
        });
    }, [clases, selecciones]);
    
    // --- Lógica de Manejo de Selección (Mueve la lógica de DetalleProducto aquí) ---
    const handleToggleIngrediente = (claseId: number, ingrediente: Ingrediente) => {
        setSelecciones(prev => {
            const currentList = prev[claseId] || [];
            const exists = currentList.find(i => i.id === ingrediente.id);
            
            // 1. Buscar la información de la CLASE actual para ver sus reglas
            const claseInfo = clases.find(c => c.id === claseId);
            const esSeleccionUnica = claseInfo?.single_selection;

            

            if (esSeleccionUnica) {
                // LOGICA RADIO BUTTON:
                // Si es selección única, reemplazamos toda la lista con el nuevo ingrediente
                // (Si ya estaba seleccionado, lo podemos dejar o quitar, usualmente en radio buttons se deja o se cambia, aquí permitiremos desmarcar si se toca el mismo)
                if (exists) {
                    return { ...prev, [claseId]: [] }; // Desmarcar (Opcional, si quieres obligar a tener 1, quita este if)
                } else {
                    return { ...prev, [claseId]: [ingrediente] }; // Reemplazar
                }
            } else {
                // LOGICA CHECKBOX (Múltiple):
                // Comportamiento anterior
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
    
    // --- Confirmación y Añadir al Carrito ---
    const handleConfirmarPedido = () => {
        if (isFormValid && productoBase) {
            const itemParaCarrito: Omit<ItemCarrito, 'idUnico' | 'cantidad'> = {
                productoBase: productoBase,
                precioUnitario: precioTotal,
                personalizacion: selecciones,
            };
            agregarItem(itemParaCarrito); 
            alert(`Chapata añadida al carrito por $${precioTotal.toFixed(2)}.`);
            navigate('/carrito'); 
        } else {
            alert("Por favor, selecciona las opciones obligatorias.");
        }
    };
    
    if (!productoBase) return <div className="text-center p-8">Cargando Personalizador...</div>;

    // Renderizado (Diseño similar a image_52a502.png)
    return (
        <div className="min-h-screen bg-white p-6 md:p-10">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h1 className="text-4xl font-extrabold text-orange-600">Personalizar Pedido</h1>
                    <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-800">
                        &larr; Volver
                    </button>
                </div>
                
                <div className="md:flex gap-8">
                    {/* Columna Izquierda: Imagen y Total */}
                    <div className="md:w-1/2">
                        <img 
                            src={productoBase.image || 'https://i.pinimg.com/originals/fb/1a/3b/fb1a3bfd4fb96c76d9f877b57259b345.jpg'} 
                            alt={productoBase.name} 
                            className="w-full h-auto rounded-lg shadow-xl mb-4"
                        />
                        
                        <div className="border-t pt-4 mt-4">
                            <h2 className="text-3xl font-extrabold text-gray-900 text-center">
                                Total: <span className='text-orange-600'>${precioTotal.toFixed(2)}</span>
                            </h2>
                            <button
                                onClick={handleConfirmarPedido}
                                disabled={!isFormValid}
                                className={`w-full py-3 mt-4 font-bold rounded-lg transition-colors ${
                                    isFormValid ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-gray-400 text-gray-700 cursor-not-allowed'
                                }`}
                            >
                                Añadir al Carrito
                            </button>
                        </div>
                    </div>

                    {/* Columna Derecha: Opciones de Personalización */}
                    <div className="md:w-1/2 pt-6 md:pt-0">
                        {clases.map(clase => (
                            <div key={clase.id} className="mb-8 pb-4 border-b">
                                <h3 className="text-xl font-bold text-gray-800 mb-3">
                                    {clase.name} 
                                    {clase.required && <span className="text-red-500 text-sm ml-2"> (Obligatorio)</span>}
                                    {clase.single_selection && (
                                        <span className="ml-2 text-xs font-normal text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                                            Elige solo 1
                                        </span>
                                    )}
                                </h3>

                                <div className="grid grid-cols-3 gap-3">
                                    
                                    {clase.ingredientes.map(ingrediente => {
                                        const isAgotado = !ingrediente.available ;
                                        const isSelected = selecciones[clase.id]?.some(i => i.id === ingrediente.id);
                                        return (
                                            <button
                                                key={ingrediente.id}
                                                disabled={isAgotado} // Bloquear clic
                                                onClick={() => handleToggleIngrediente(clase.id, ingrediente)}
                                                className={`p-3 rounded-lg border text-left flex justify-between items-center relative ${
                                                    isAgotado 
                                                        ? 'bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed' // Estilo Agotado
                                                        : isSelected 
                                                            ? 'border-orange-500 bg-orange-50' 
                                                            : 'border-gray-200 hover:border-orange-300'
                                                }`}
                                            >
                                                <div className="flex items-center">
                                                    {/* ... Iconos ... */}
                                                    <span className={isSelected ? 'font-bold text-orange-800' : 'text-gray-700'}>
                                                        {ingrediente.name}
                                                    </span>
                                                </div>
                                                
                                                {/* Etiqueta Agotado */}
                                                {isAgotado && (
                                                    <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] px-1.5 rounded-bl font-bold">
                                                        AGOTADO
                                                    </span>
                                                )}
                                                
                                                {/* ... Precio Extra ... */}
                                                {Number(ingrediente.additional_price) > 0 && (
                                                    <span className="text-xs font-bold text-green-600">
                                                        +${ingrediente.additional_price}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Personalizador;