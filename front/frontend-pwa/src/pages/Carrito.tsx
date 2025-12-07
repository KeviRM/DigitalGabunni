import React from "react";
import { useNavigate } from "react-router-dom";
import { useCarrito } from "../context/CarritoContext";



const Carrito: React.FC = () => {


  const { items, totalPrecio, eliminarItem, actualizarCantidad } = useCarrito();
  const navigate = useNavigate();


  //Funcion formatea los detalles de forma legible

  const getPersonalizacionDetalle = (personalizacion: any) => {
    if (!personalizacion) return "Producto Estandar";

    const detalles: string[] = [];
    Object.values(personalizacion).forEach((ingredientes: any) => {
      if (Array.isArray(ingredientes)) {
        // Si es un array, podemos recorrerlo
        ingredientes.forEach((ingrediente: any) => {
          // Aquí extraemos el nombre de la forma correcta
          if (ingrediente && ingrediente.name) {
            detalles.push(ingrediente.name);
          }
        });
      }
    });


    return detalles.length > 0 ? detalles.join(', ') : "Sin Personalizacion";

  };


  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-6 md:mb-8 border-b-2 border-yellow-500 pb-3">
          Carrito de Compras
        </h1>

        {items.length === 0 ? (
          <div className="bg-white p-10 rounded-xl shadow-lg text-center">
            <p className="text-xl text-gray-500 mb-6">Tu carrito está vacío.</p>
            <button
              onClick={() => navigate('/menu')}
              className="px-6 py-3 bg-yellow-500 text-gray-900 font-semibold rounded-lg hover:bg-yellow-600 transition-colors"
            >
              Explorar Menú
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">

            {/* Listado de Productos en el Carrito  */}
            {items.map(item => (
              <div key={item.idUnico} className="flex flex-col sm:flex-row items-center sm:items-start border-b py-6 last:border-b-0 gap-4 sm:gap-6">
                <img
                  src={item.productoBase.image || 'https://1.bp.blogspot.com/-JUmaXrEYbPs/XnPhc3k7V0I/AAAAAAAAN0A/reZohppseB4uFlD3L6JS5Xv6yngGprCZgCLcBGAsYHQ/s1600/chapata.jpg'}
                  alt={item.productoBase.name}
                  className="w-full h-48 sm:w-32 sm:h-32 object-cover rounded-lg"
                />
                <div className="grow w-full">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
                    <h2 className="text-xl font-bold text-gray-800">{item.productoBase.name}</h2>
                    <span className="text-lg font-bold text-gray-900 mt-1 sm:mt-0">
                      ${item.precioUnitario.toFixed(2)}/u
                    </span>
                  </div>

                  <p className="text-sm text-gray-500 mb-4">
                    Detalle: {getPersonalizacionDetalle(item.personalizacion)}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-lg text-green-600">
                        ${(item.precioUnitario * item.cantidad).toFixed(2)}
                      </span>

                      {/* Control de Cantidad */}
                      <div className="flex items-center border rounded-lg overflow-hidden">
                        <button
                          onClick={() => actualizarCantidad(item.idUnico, Math.max(1, item.cantidad - 1))}
                          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                        >-</button>
                        <input
                          type="number"
                          min="1"
                          value={item.cantidad}
                          onChange={(e) => actualizarCantidad(item.idUnico, parseInt(e.target.value) || 1)}
                          className="w-12 p-1 text-center text-sm border-x focus:outline-none"
                        />
                        <button
                          onClick={() => actualizarCantidad(item.idUnico, item.cantidad + 1)}
                          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                        >+</button>
                      </div>
                    </div>

                    {/* Contenido del paquete */}
                    {item.contenidoPaquete && (
                      <div className="w-full sm:w-auto mt-2 sm:mt-0 bg-gray-50 p-2 rounded-lg border border-orange-100 inline-block">
                        <p className="text-xs font-bold text-orange-800 mb-1 uppercase">Incluye:</p>
                        <ul className="text-sm text-gray-700 space-y-1">
                          {item.contenidoPaquete.map((subItem, idx) => (
                            <li key={idx} className="flex items-center">
                              <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2 py-0.5 rounded-full mr-2">
                                {subItem.quantity}x
                              </span>
                              {subItem.product_name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Opción de eliminar  */}
                    <button
                      onClick={() => eliminarItem(item.idUnico)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors ml-auto sm:ml-0"
                    >
                      (Eliminar)
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Resumen del Total y Botón de Checkout */}
            <div className="mt-6 pt-6 border-t-2 border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-2xl font-extrabold text-gray-900 w-full sm:w-auto text-center sm:text-left">
                Total: <span className="text-yellow-600">${totalPrecio.toFixed(2)}</span>
              </div>

              <button
                onClick={() => navigate('/checkout')} // Próxima etapa
                className="w-full sm:w-auto px-8 py-3 bg-orange-600 text-white font-bold rounded-lg shadow-xl hover:bg-orange-700 transition-colors text-center"
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