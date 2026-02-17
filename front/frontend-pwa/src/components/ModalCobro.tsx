import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { pedidosApi } from '../api/axiosConfig';
import useAuth from '../hooks/useAuth';
const PEDIDOS_API_URL = '/api/v1/pedidos/caja/';
  


const ModalCobro = ({ isOpen, onClose, orderNumber, total, onPaymentSuccess }) => {
  const [metodoPago, setMetodoPago] = useState('EFECTIVO');
  const [recibido, setRecibido] = useState('');
  const [cambio, setCambio] = useState(0);
  const [procesando, setProcesando] = useState(false);
  const {getAuthHeaders, isAuthenticated} = useAuth();

  

  // Calcular cambio automáticamente cuando escribe
  useEffect(() => {
    const monto = parseFloat(recibido) || 0;
    const totalPagar = parseFloat(total);
    if (monto >= totalPagar) {
      setCambio(monto - totalPagar);
    } else {
      setCambio(0);
    }
  }, [recibido, total]);

  const handlePago = async () => {
    setProcesando(true);

    if (!isAuthenticated) return; 
    try {
      const AUTH_HEADERS = {headers: getAuthHeaders()};
      
      const response = await pedidosApi.post(
        `${PEDIDOS_API_URL}${orderNumber}/confirmar_pago/`,
        {
          monto_recibido: metodoPago === 'EFECTIVO' ? parseFloat(recibido) : parseFloat(total),
          metodo_pago: metodoPago
        },
        AUTH_HEADERS
      );

      if (response.status === 200) {
        alert('¡Venta Exitosa!');
        onPaymentSuccess();
        onClose();
      }
    } catch (error) {
      console.error("Error al cobrar:", error);
      alert('Error al procesar el pago. Revisa si tienes caja abierta.');
    } finally {
      setProcesando(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0  flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-2xl shadow-gray-600  p-8 w-[600px]">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-700">Cobrar Orden #{orderNumber}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 font-bold text-xl">✕</button>
        </div>

        {/* Total Gigante */}
        <div className="text-center mb-8">
          <p className="text-green-600 font-bold text-5xl">${parseFloat(total).toFixed(2)}</p>
        </div>

        {/* Selector Método */}
        <div className="flex gap-4 mb-8">
          <button 
            onClick={() => setMetodoPago('EFECTIVO')}
            className={`flex-1 py-3 rounded-lg font-bold border-2 ${metodoPago === 'EFECTIVO' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-500 border-gray-200'}`}
          >
            EFECTIVO 
          </button>
          <button 
            onClick={() => setMetodoPago('TARJETA')}
            className={`flex-1 py-3 rounded-lg font-bold border-2 ${metodoPago === 'TARJETA' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-500 border-gray-200'}`}
          >
            TARJETA 
          </button>
        </div>

        {/* Zona de Efectivo */}
        {metodoPago === 'EFECTIVO' && (
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <div className="flex justify-between items-end mb-4">
              <div className="w-1/2 pr-2">
                <label className="block text-sm font-bold text-gray-600 mb-1">Recibido:</label>
                <input 
                  type="number" 
                  autoFocus
                  value={recibido}
                  onChange={(e) => setRecibido(e.target.value)}
                  className="w-full text-3xl font-bold p-2 border-b-2 border-gray-300 focus:border-green-500 outline-none bg-transparent"
                  placeholder="$0.00"
                />
              </div>
              <div className="w-1/2 pl-2 text-right">
                <label className="block text-sm font-bold text-gray-600 mb-1">Cambio:</label>
                <p className="text-3xl font-bold text-gray-800">${cambio.toFixed(2)}</p>
              </div>
            </div>

            {/* Botones Rápidos */}
            <div className="flex gap-2">
              <button onClick={() => setRecibido(total)} className="px-3 py-1 bg-gray-200 rounded-full text-sm font-bold text-gray-600 hover:bg-green-100 hover:text-green-700">Exacto</button>
              <button onClick={() => setRecibido(500)} className="px-3 py-1 bg-gray-200 rounded-full text-sm font-bold text-gray-600 hover:bg-gray-300">$500</button>
              <button onClick={() => setRecibido(1000)} className="px-3 py-1 bg-gray-200 rounded-full text-sm font-bold text-gray-600 hover:bg-gray-300">$1000</button>
            </div>
          </div>
        )}

        {/* Botón Finalizar */}
        {/* Lógica corregida para el botón */}
        {(() => {
          // Calculamos valores seguros (si está vacío, vale 0)
          const montoIngresado = parseFloat(recibido) || 0;
          const montoTotal = parseFloat(total);
          
          // Solo bloqueamos si es EFECTIVO y falta dinero
          const pagoIncompleto = metodoPago === 'EFECTIVO' && montoIngresado < montoTotal;

          return (
            <button 
              onClick={handlePago}
              disabled={pagoIncompleto || procesando}
              className={`w-full py-4 rounded-lg font-bold text-xl shadow-lg transition-all
                ${(pagoIncompleto || procesando)
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-orange-500 hover:bg-orange-600 text-white transform hover:scale-[1.02]'}`}
            >
              {procesando ? 'Procesando...' : 'FINALIZAR VENTA ↵'}
            </button>
          );
        })()}
      </div>
    </div>
  );
};

export default ModalCobro;