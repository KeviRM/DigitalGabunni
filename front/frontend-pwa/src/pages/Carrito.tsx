import React from "react";
import { useNavigate } from "react-router-dom";
import { useCarrito } from "../context/CarritoContext";



const Carrito : React.FC = () => {


    const { items, totalPrecio, eliminarItem, actualizarCantidad } = useCarrito();
    const navigate = useNavigate();


    //Funcion formatea los detalles de forma legible

    const getPersonalizacionDetalle = (personalizacion: any) => {
        if (!personalizacion) return "Producto Estandar";

        const detalles: string[] = [];
        Object.values(personalizacion).forEach((ingredientes: any) =>{
            ingredientes.foreach((ingredientes: any) =>{
                detalles.push(ingredientes.name);
            });
        });
        

        return detalles.length > 0 ? detalles.join(', ') : "Sin Personalizacion";

    };



    return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-8 border-b-2 border-yellow-500 pb-3">
            Carrito de Compras
        </h1>


        {items.length === 0 ? (
          <div className="bg-white p-10 rounded-xl shadow-lg text-center">
            <p className="text-xl text-gray-500 mb-6">Tu carrito está vacío.</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-yellow-500 text-gray-900 font-semibold rounded-lg hover:bg-yellow-600 transition-colors"
            >
              Explorar Menú
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-6">
            
            {/* Listado de Productos en el Carrito  */}
            {items.map(item => (
              <div key={item.idUnico} className="flex items-start border-b py-4 last:border-b-0">
                <div className="grow">
                  <h2 className="text-xl font-bold text-gray-800">{item.productoBase.name}</h2>
                  <p className="text-sm text-gray-500 mt-1 mb-2">
                    Detalle: {getPersonalizacionDetalle(item.personalizacion)}
                  </p>
                  
                  <div className="flex items-center space-x-4">
                    <span className="font-semibold text-lg text-green-600">
                      ${(item.precioUnitario * item.cantidad).toFixed(2)} 
                    </span>
                    
                    {/* Control de Cantidad (Opcional, pero útil) */}
                    <input
                        type="number"
                        min="1"
                        value={item.cantidad}
                        onChange={(e) => actualizarCantidad(item.idUnico, parseInt(e.target.value))}
                        className="w-16 p-1 border rounded text-center text-sm"
                    />

                    {/* Opción de eliminar  */}
                    <button
                      onClick={() => eliminarItem(item.idUnico)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                    >
                      (Eliminar)
                    </button>
                  </div>
                </div>
                <span className="text-lg font-bold text-gray-900">
                  ${item.precioUnitario.toFixed(2)}/u
                </span>
              </div>
            ))}
            
            {/* Resumen del Total y Botón de Checkout */}
            <div className="mt-6 pt-4 border-t-2 border-gray-100 flex justify-between items-center">
              <div className="text-2xl font-extrabold text-gray-900">
                Total del Pedido: <span className="text-yellow-600">${totalPrecio.toFixed(2)}</span> 
              </div>

              <button
                onClick={() => navigate('/checkout')} // Próxima etapa
                className="px-8 py-3 bg-orange-600 text-white font-bold rounded-lg shadow-xl hover:bg-orange-700 transition-colors"
              >
                Continuar con el Pago
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );





};

export default Carrito;