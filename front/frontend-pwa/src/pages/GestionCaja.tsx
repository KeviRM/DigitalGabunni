import React, { useState, useEffect, useCallback } from 'react';
import { pedidosApi } from '../api/axiosConfig';
import useAuth from '../hooks/useAuth';
const PEDIDOS_API_URL = '/api/v1/pedidos/';

const GestionCaja = () => {
  const { getAuthHeaders, user } = useAuth();
  
  // Estados de la interfaz
  const [cargando, setCargando] = useState(true);
  const [sesionActiva, setSesionActiva] = useState<any>(null);
  
  // Estados para ABRIR caja
  const [fondoInicial, setFondoInicial] = useState('');

  // Estados para CERRAR caja
  const [conteoEfectivo, setConteoEfectivo] = useState('');
  const [conteoTarjeta, setConteoTarjeta] = useState('');

  // --- 1. CARGAR ESTADO ACTUAL ---
  const cargarEstadoCaja = useCallback(async () => {
    setCargando(true);
    try {
      // Intentamos obtener el resumen actual
      const response = await pedidosApi.get(`${PEDIDOS_API_URL}sesion-caja/resumen_actual/`, {
        headers: getAuthHeaders()
      });
      // Si responde 200, hay caja abierta
      setSesionActiva(response.data);
    } catch (error: any) {
      // Si responde 404, NO hay caja abierta
      if (error.response && error.response.status === 404) {
        setSesionActiva(null);
      } else {
        console.error("Error al verificar caja:", error);
      }
    } finally {
      setCargando(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    cargarEstadoCaja();
  }, [cargarEstadoCaja]);

  // ---  FUNCIÓN PARA ABRIR CAJA ---
  const handleAbrirCaja = async () => {
    if (!fondoInicial) return alert("Ingresa el fondo inicial");
    
    try {
      
      await pedidosApi.post(`${PEDIDOS_API_URL}sesion-caja/`, {
        usuario: user?.user_id, 
        fondo_inicial: parseFloat(fondoInicial),
        estado: 'ABIERTA'
      }, { headers: getAuthHeaders() });

      alert(" Caja Abierta Correctamente");
      cargarEstadoCaja(); 
    } catch (error) {
      console.error("Error al abrir:", error);
      alert("Error al abrir caja. Revisa la consola.");
    }
  };

  // -- FUNCIÓN PARA CERRAR CAJA (CORTE) ---
  const handleCerrarCaja = async () => {
    if (!sesionActiva) return;
    
    const confirmar = window.confirm("¿Estás seguro de realizar el corte de caja? Esto cerrará el turno.");
    if (!confirmar) return;

    try {
      const response = await pedidosApi.post(`${PEDIDOS_API_URL}sesion-caja/${sesionActiva.sesion_id}/cerrar/`, {
        total_real_efectivo: parseFloat(conteoEfectivo) || 0,
        total_real_tarjeta: parseFloat(conteoTarjeta) || 0
      }, { headers: getAuthHeaders() });

      alert(`✅ Turno Cerrado.\nDiferencia: $${response.data.diferencia_total}`);
      setSesionActiva(null); // Volvemos a la pantalla de apertura
      setFondoInicial('');
      setConteoEfectivo('');
      setConteoTarjeta('');
    } catch (error) {
      console.error("Error al cerrar:", error);
      alert("Error al realizar el corte.");
    }
  };

  if (cargando) return <div className="p-10 text-center">Cargando Caja...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-8 border-b-4 border-orange-600 pb-2">
        Gestión de Caja 
      </h1>

      {!sesionActiva ? (
        // --- VISTA 1: CAJA CERRADA (FORMULARIO APERTURA) ---
        <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md text-center">
          <div className="text-6xl mb-4"> </div>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Turno Cerrado</h2>
          <p className="text-gray-500 mb-6">Ingresa el fondo inicial para comenzar a vender.</p>
          
          <div className="text-left mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-1">Fondo Inicial (Monedas/Billetes):</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500 font-bold">$</span>
              <input 
                type="number" 
                value={fondoInicial}
                onChange={(e) => setFondoInicial(e.target.value)}
                className="w-full pl-8 p-2 border-2 border-gray-300 rounded-lg focus:border-green-500 outline-none text-xl font-bold"
                placeholder="0.00"
              />
            </div>
          </div>

          <button 
            onClick={handleAbrirCaja}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow-lg transition-transform hover:scale-105"
          >
            ABRIR CAJA 
          </button>
        </div>
      ) : (
        // --- CAJA ABIERTA (CORTE DE CAJA) ---
        <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-4xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-green-700">Turno Abierto </h2>
              <p className="text-gray-500 text-sm">Sesión ID: #{sesionActiva.sesion_id}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-600 font-bold">Fondo Inicial</p>
              <p className="text-xl">${parseFloat(sesionActiva.fondo_inicial).toFixed(2)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* COLUMNA IZQUIERDA: LO QUE DICE EL SISTEMA */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2"> Sistema (Esperado)</h3>
              
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Ventas Efectivo:</span>
                <span className="font-bold text-gray-800">${sesionActiva.ventas_efectivo.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Ventas Tarjeta:</span>
                <span className="font-bold text-gray-800">${sesionActiva.ventas_tarjeta.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mt-4 pt-2 border-t border-gray-300">
                <span className="text-lg font-bold text-gray-700">Total en Caja:</span>
                <span className="text-2xl font-bold text-blue-600">${sesionActiva.total_esperado.toFixed(2)}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">* Incluye Fondo Inicial + Ventas Efectivo</p>
            </div>

            {/* COLUMNA DERECHA: LO QUE CUENTA EL CAJERO */}
            <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
              <h3 className="text-lg font-bold text-orange-800 mb-4 border-b border-orange-200 pb-2"> Tu Conteo (Real)</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-1">Efectivo en Cajón:</label>
                <input 
                  type="number" 
                  value={conteoEfectivo}
                  onChange={(e) => setConteoEfectivo(e.target.value)}
                  className="w-full p-2 border border-orange-300 rounded focus:ring-2 focus:ring-orange-500 outline-none text-right font-bold text-lg"
                  placeholder="$0.00"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-1">Vouchers / Tarjeta:</label>
                <input 
                  type="number" 
                  value={conteoTarjeta}
                  onChange={(e) => setConteoTarjeta(e.target.value)}
                  className="w-full p-2 border border-orange-300 rounded focus:ring-2 focus:ring-orange-500 outline-none text-right font-bold text-lg"
                  placeholder="$0.00"
                />
              </div>

              {/* Calculadora de Diferencia en tiempo real */}
              <div className="mt-4 pt-2 border-t border-orange-200 flex justify-between items-center">
                <span className="font-bold text-gray-700">Diferencia:</span>
                {(() => {
                   const sistema = sesionActiva.total_esperado;
                   const real = (parseFloat(conteoEfectivo) || 0) + (parseFloat(conteoTarjeta) || 0) + (sesionActiva.fondo_inicial - sesionActiva.fondo_inicial); 
                   
                   const dif = (parseFloat(conteoEfectivo) || 0) - (sesionActiva.total_esperado - sesionActiva.ventas_tarjeta); 
                   
                   const diffEfec = (parseFloat(conteoEfectivo) || 0) - (sesionActiva.fondo_inicial + sesionActiva.ventas_efectivo);
                   
                   return (
                     <span className={`font-bold text-xl ${diffEfec >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                       {diffEfec > 0 ? '+' : ''}{diffEfec.toFixed(2)}
                     </span>
                   )
                })()}
              </div>
            </div>
          </div>

          <button 
            onClick={handleCerrarCaja}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-lg shadow-lg text-xl transition-colors"
          >
            REALIZAR CORTE Y CERRAR 
          </button>
        </div>
      )}
    </div>
  );
};

export default GestionCaja;