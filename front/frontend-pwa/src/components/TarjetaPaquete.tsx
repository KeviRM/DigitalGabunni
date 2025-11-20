import React from "react";
import type{ Paquete } from "../types/menu";
import { FaGift, FaShoppingCart } from "react-icons/fa";



interface TarjetaPaqueteProps {
    paquete: Paquete;
    onAddToCart: (paquete: Paquete) => void;
}


const TarjetaPaquete: React.FC<TarjetaPaqueteProps> = ({ paquete, onAddToCart}) => {
    const discount = parseFloat(paquete.discount);

    //Calcular el dinero que ahorra el cliente

    const precioFinal = parseFloat(paquete.price);
    const precioOriginal = discount > 0 ? precioFinal / (1 - (discount / 100)) : precioFinal;



    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-[1.02] transition duration-300 border-2 border-orange-100 relative">
            
            {/* Badge de Descuento */}
            {discount > 0 && (
                <div className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10">
                    {discount}% OFF
                </div>
            )}

            <div className="relative h-48 bg-orange-50 flex items-center justify-center">
                {paquete.image ? (
                    <img src={paquete.image} alt={paquete.name} className="w-full h-full object-cover" />
                ) : (
                    <FaGift className="text-6xl text-orange-300" />
                )}
            </div>

            <div className="p-4">
                <h3 className="text-xl font-bold text-gray-800">{paquete.name}</h3>
                
                <div className="flex items-center space-x-2 mt-1 mb-2">
                    <span className="text-2xl font-extrabold text-green-600">${precioFinal.toFixed(2)}</span>
                    {discount > 0 && (
                        <span className="text-sm text-gray-400 line-through">${precioOriginal.toFixed(2)}</span>
                    )}
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{paquete.description}</p>
                
                {/* Lista de lo que incluye */}
                <div className="bg-gray-50 p-2 rounded-lg mb-4 text-xs text-gray-700">
                    <p className="font-semibold mb-1">Incluye:</p>
                    <ul className="list-disc list-inside">
                        {paquete.items.map(item => (
                            <li key={item.id}>{item.quantity}x {item.product_name}</li>
                        ))}
                    </ul>
                </div>

                <button 
                    onClick={(e) => { e.stopPropagation(); onAddToCart(paquete); }}
                    className="w-full py-2 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center"
                >
                    <FaShoppingCart className="mr-2" /> Pedir Paquete
                </button>
            </div>
        </div>
    );


};



export default TarjetaPaquete;