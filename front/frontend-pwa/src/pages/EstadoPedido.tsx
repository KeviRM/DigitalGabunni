import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { pedidosApi } from '../api/axiosConfig';

import { type PedidoStatus, EstadoAmigable } from "../types/pedido";
import { useOrderWebSocket } from '../hooks/useOrderWebSocket';

const PEDIDOS_API_URL = '/api/v1/pedidos/';



const EstadoPedido: React.FC = () => {
  const { numeroPedidoUnico } = useParams<{ numeroPedidoUnico: string }>();
  const [pedido, setPedido] = useState<PedidoStatus | null>(null);
  
  const navigate = useNavigate();

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { lastMessage } = useOrderWebSocket(numeroPedidoUnico || '');

//carga inicial http
  useEffect(() => {
        if (numeroPedidoUnico) fetchPedido(numeroPedidoUnico);
    }, [numeroPedidoUnico]);

    const fetchPedido = async (id:string) => {
      try {
        const response = await pedidosApi.get(`${PEDIDOS_API_URL}estado/${numeroPedidoUnico}/`);
        setPedido(response.data);
      } catch (err) {
        console.error("Error al cargar pedido", err);
        // Manejo de error si no existe
      } finally {
        setCargando(false);
      }
    };

   

    // Reaccionar al WebSocket
    useEffect(() => {
        if (lastMessage) {
            // Doble verificación de seguridad
            if (lastMessage.order_number === numeroPedidoUnico) {
                console.log(" Cliente recibió cambio de estado:", lastMessage.status);
                setPedido((prev: any) => ({ ...prev, status: lastMessage.status }));
            }
        }
    }, [lastMessage, numeroPedidoUnico]);


  const getPersonalizacionDetalle = (personalizacion: any): string => {
    if (!personalizacion) return "Estandar";

    const nombres = Object.values(personalizacion).flatMap((ingredientes: any) => ingredientes.map((ing: any) => ing.name));

    return nombres.join(', ');

  }


  //Funcion Para el estado visual del proceso

  const getEstadoStep = (current: string, target: string) => {


    const steps = ['CONFIRMADO', 'PREPARACION', 'LISTO'];

    const currentIndex = steps.indexOf(current);

    const targetIndex = steps.indexOf(target);


    if (currentIndex === -1 || targetIndex === -1) return 'bg-gray-200';

    if (targetIndex <= currentIndex) return 'bg-green-600 text-white';
    if (targetIndex === currentIndex + 1) return 'bg-orange-400 text-gray-800';


    return 'bg-gray-200 text-gray-500';


  };







  if (cargando) return <div className="text-center p-20 text-xl font-medium"> Buscando pedido....</div>;
  if (error) return <div className="text-center p-20 text-xl text-red-500">{error}</div>;
  if (!pedido) return <div className="text-center p-20 text-xl text-gray-500">No se encontro el pedido</div>;

  return (


    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl p-8">
        <h1 className="text-3xl font-extrabold text-gray-700 mb-4">
          Seguimiento de tu Pedido <span className='text-orange-600'>#{numeroPedidoUnico?.substring(0, 8)}</span>
        </h1>
        <p className="text-gray-600 mb-8">
          Estado Actual: <span className={`font-bold ${pedido.status === 'LISTO' ? 'text-green-600' : 'text-orange-700'}`}>
            {EstadoAmigable[pedido.status]}
          </span>
        </p>

        {/* --- Indicador de Progreso del Pedido*/}
        <div className="flex justify-between items-center mb-10 relative">
          <div className="absolute top-1/2 w-full h-1 bg-gray-200 -z-10"></div>
          {['CONFIRMADO', 'PREPARACION', 'LISTO'].map(step => (
            <div key={step} className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${getEstadoStep(pedido.status, step)} shadow-md`}>
                {step.substring(0, 1)}
              </div>
              <p className="mt-2 text-xs font-semibold text-center">{EstadoAmigable[step]}</p>
            </div>
          ))}
        </div>

        {/* --- Detalles del Pedido --- */}
        <div className='grid md:grid-cols-2 gap-8 mt-8'>
          {/* Resumen General */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Información del Pedido</h2>
            <p><strong>Total:</strong> <span className='text-green-600 font-extrabold'>${Number(pedido.amount).toFixed(2)}</span></p>
            <p><strong>Tipo de Entrega:</strong> {pedido.type_delivery === 'RECOGER' ? 'Recoger en Local' : 'A Domicilio'}</p>
            <p><strong>Fecha:</strong> {new Date(pedido.created_at).toLocaleTimeString()} - {new Date(pedido.created_at).toLocaleDateString()}</p>
          </div>

          {/* Listado de Productos */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Artículos</h2>
            {pedido.details?.map((detail, index) => (
              <div key={index} className="mb-3 p-3 bg-gray-50 rounded-lg">
                <p className="font-semibold">{detail.quantity}x {detail.product_name}</p>
                <p className="text-xs text-gray-500">
                  Ingredientes: {getPersonalizacionDetalle(detail.personalizacion_json)}
                </p>
                <p className="text-sm font-medium mt-1">
                  Subtotal: ${(detail.unit_price * detail.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>



        <button
          onClick={() => navigate('/mi-perfil')}
          className="mt-10 py-3 px-6 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
        >
          Volver al Menú Principal
        </button>

      </div>
    </div>


  );



};


export default EstadoPedido;