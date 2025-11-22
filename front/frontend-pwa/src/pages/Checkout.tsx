import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useCarrito } from "../context/CarritoContext";
import useAuth from '../hooks/useAuth';

import { FaUserLock, FaSignInAlt, FaUserPlus } from 'react-icons/fa';





const PEDIDOS_API_URL = 'http://127.0.0.1:8001/api/v1/pedidos/';



const Checkout : React.FC = () => {

    const { items, totalPrecio, limpiarCarrito } = useCarrito();

    const { isAuthenticated, getAuthHeaders, getUserRole } = useAuth(); // Obtener estado de auth
    
    const navigate = useNavigate();

    
    const [tipoEntrega, setTipoEntrega] = useState< 'RECOGER' | 'DOMICILIO'>('RECOGER');
    const [nombre, setNombre] = useState('');
    const [direccion, setDireccion] = useState('');
    const [telefono, setTelefono] = useState('');
    const [error, setError] = useState<string | null>('null');
    const [cargando, setCargando] = useState(false);



    useEffect(() => {
    // Opcional: Si prefieres redirigir automáticamente
    // if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);


  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full">
          <FaUserLock className="text-6xl text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Inicia sesión para continuar</h2>
          <p className="text-gray-600 mb-6">
            Necesitas una cuenta activa para realizar pedidos y acumular puntos.
          </p>
          
          <div className="space-y-3">
            <button 
                onClick={() => navigate('/login')}
                className="w-full py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 flex items-center justify-center"
            >
                <FaSignInAlt className="mr-2" /> Iniciar Sesión
            </button>
            <button 
                onClick={() => navigate('/registro')}
                className="w-full py-3 border border-orange-500 text-orange-500 font-bold rounded-lg hover:bg-orange-50 flex items-center justify-center"
            >
                <FaUserPlus className="mr-2" /> Crear Cuenta
            </button>
          </div>
          <button onClick={() => navigate('/')} className="mt-6 text-sm text-gray-500 hover:underline">
              Volver al Menú
          </button>
        </div>
      </div>
    );
  }









    if (items.length === 0){
        return (
            
      <div className="text-center p-20">
        <h2 className="text-2xl text-red-500">No hay ítems en el carrito para pagar.</h2>
        <button onClick={() => navigate('/')} className="mt-4 text-green-900 ">Volver al menú</button>
      </div>

        );
    }


    const handleConfirmarPedido = async () =>{
        if(!nombre || !telefono || (tipoEntrega == 'DOMICILIO' && !direccion)){
            setError("Por favor complete todos los campos obligatorios");
            return;
        }
    
      setError(null);
      setCargando(true);




      // Mapear los ítems del carrito al formato esperado por el serializer de Django

      const itemsParaDjango = items.map(item => ({
        product_name: item.productoBase.name,
        quantity: item.cantidad,
        unit_price: item.precioUnitario.toFixed(2),
        personalizacion_json: item.personalizacion || null,
      }));

      const datosPedido = {
          client_name: nombre,
          phone_number: telefono,
          type_delivery: tipoEntrega,
          delivery_address: tipoEntrega === 'DOMICILIO' ? direccion : null,
          amount: totalPrecio.toFixed(2),
          items_carrito: itemsParaDjango,
      };

      try {

        const AUTH_HEADERS = { headers: getAuthHeaders() };

        const response = await axios.post(PEDIDOS_API_URL + 'crear/', datosPedido, AUTH_HEADERS);      
        
        const numeroPedidoUnico = response.data.order_number;
        limpiarCarrito();

        navigate(`/pedido/estado/${numeroPedidoUnico}`);


      } catch (err: any) { // Usamos 'any' para acceder a la estructura de AxiosError
       console.error("Error al confirmar:", err);
      if (err.response?.status === 401) {
          setError("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
      } else {
          setError("Hubo un error al procesar tu pedido. Inténtalo de nuevo.");
      }
    } finally {
      setCargando(false);
    }

    };

    return (
      <div className="min-h-screen bg-gray-50 p-6 md:p-10">

        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">

          <h1 className="text-3xl font-extrabold text-gray-600 mb-6 borde-b pb-2">
            Confirmar Pedido
          </h1>

          <div className="grid mid:grid-cols-2 gap-8">
            {/* El Tipo de tipoEntrega y contacto */}
            <div>
              <h2 className="text-xl font-bold text-orange-700 mb-4">
                Tipo de Entrega
              </h2>

              <div className="flex space-x-4 mb-6">
                <button
                  onClick={() => setTipoEntrega('RECOGER')}
                  className= {`flex-1 py-3 font-semibold rounded-lg transition-color ${
                    tipoEntrega === 'RECOGER' ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-orange-100'
                  }`}
                >
                  Recoger en Local
                </button>

                <button
                onClick={() => setTipoEntrega('DOMICILIO')}
                className={`flex-1 py-3 font-semibold rounded-lg transition-colors ${
                  tipoEntrega === 'DOMICILIO' ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-orange-100'
                }`}
                >
                  A Domicilio
                </button>
              </div>



                <h2 className="text-xl font-bold text-orange-700 mb-4"> Datos de Contacto</h2>

                <input type="text"
                  placeholder="Nombre Completo"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full p-3 border rounded-lg mb-4"
                />

                <input type="tel"
                  placeholder="Telefono(Requerido)"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="w-full p-3 border rounded-lg mb-4"
                />

                {tipoEntrega == 'DOMICILIO' && (
                  <textarea
                  placeholder="Direccion de Entrega Completa"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}  
                  rows={3}
                  className="w-full p-3 border rounded-lg"
                  />
                    
                )}

               
                {error &&  <p className="text-red-500 mt-4 font-semibold">{error}</p>}

            </div>


                

            {/* Resumen de pedido */}
            <div className="bg-gray100 p-6 rounded-lg">
              <h2 className="text-lg font-bold text-gray-800 mb-4"> Resumen </h2>
              
              {items.map(item => (
                <div key={item.idUnico} className="flex justify-between text-sm py-1">
                  <span className="text-gray-600">{item.cantidad}x {item.productoBase.name}</span>
                  <span className="font-medium">${(item.precioUnitario * item.cantidad).toFixed(2)}</span>
                </div>
              ))}

              <div className="mt-4 pt-4 border-t-2 border-gray-300 flex justify-between items-center">
                <span className="text-2xl font-extrabold text-gray-900">Total:</span>
                <span className="text-2xl font-extrabold text-yellow-600">${totalPrecio.toFixed(2)}</span>
              </div>


              <button
              onClick={handleConfirmarPedido}
              disabled={cargando}
              className={`mt-6 w-full py-4 text-white font-bold rounded-lg transition-colors ${
                cargando ? 'bg-gray-500' : 'bg-orange-600 hover:bg-orange-700 shadow-xl'
              }`}
              >
                {cargando ? 'Procesando...' : 'Confirmar Pedido y Pagar'}
                
              </button>

            </div>


          </div>


        </div>

      </div>

    );

};

export default Checkout;