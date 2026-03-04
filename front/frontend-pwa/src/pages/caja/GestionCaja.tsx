import React, { useState, useEffect, useCallback } from 'react';
import { pedidosApi } from '../../api/axiosConfig';
import useAuth from '../../hooks/useAuth';
import { FaCheck, FaTimes, FaInfo } from 'react-icons/fa'; 
import { useNavigate } from 'react-router-dom'; // <-- Agrega esta línea


const PEDIDOS_API_URL = '/api/v1/pedidos/';

const GestionCaja = () => {
    const { getAuthHeaders, user } = useAuth();
    
    // Estados de la interfaz
    const [cargando, setCargando] = useState(true);
    const [sesionActiva, setSesionActiva] = useState<any>(null);

    const navigate = useNavigate(); 
    
    // Estados para ABRIR caja
    const [fondoInicial, setFondoInicial] = useState('');

    // Estados para CERRAR caja
    const [conteoEfectivo, setConteoEfectivo] = useState('');
    const [conteoTarjeta, setConteoTarjeta] = useState('');

    // --- 1. CARGAR ESTADO ACTUAL ---
    const cargarEstadoCaja = useCallback(async () => {
        setCargando(true);
        try {
            const response = await pedidosApi.get(`${PEDIDOS_API_URL}sesion-caja/resumen_actual/`, {
                headers: getAuthHeaders()
            });
            setSesionActiva(response.data);
        } catch (error: any) {
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

    // --- FUNCIÓN PARA ABRIR CAJA ---
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
            
            navigate('/caja'); 
            
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

            alert(` Turno Cerrado.\nDiferencia: $${response.data.diferencia_total}`);
            setSesionActiva(null); 
            setFondoInicial('');
            setConteoEfectivo('');
            setConteoTarjeta('');
        } catch (error) {
            console.error("Error al cerrar:", error);
            alert("Error al realizar el corte.");
        }
    };

    /* const handleImprimirPreCorte = () => {
        alert("Funcionalidad de impresión de pre-corte en desarrollo...");
        // Aquí conectaremos el react-to-print más adelante
    }; */

    if (cargando) return <div className="p-10 text-center font-bold text-gray-500 text-xl">Cargando Caja...</div>;

    // --- CÁLCULOS EN TIEMPO REAL ---
    let diffEfectivo = 0;
    let diffTarjeta = 0;
    let diffTotal = 0;

    if (sesionActiva) {
        const fEfectivo = parseFloat(conteoEfectivo) || 0;
        const fTarjeta = parseFloat(conteoTarjeta) || 0;

        const esperadoEfectivo = parseFloat(sesionActiva.fondo_inicial) + parseFloat(sesionActiva.ventas_efectivo);
        const esperadoTarjeta = parseFloat(sesionActiva.ventas_tarjeta);

        diffEfectivo = fEfectivo - esperadoEfectivo;
        diffTarjeta = fTarjeta - esperadoTarjeta;
        diffTotal = diffEfectivo + diffTarjeta;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center font-sans">
            
            {!sesionActiva ? (
                /* ========================================================
                   VISTA 1: APERTURA DE CAJA
                   ======================================================== */
                <div className="bg-white p-10 rounded-xl shadow-2xl w-full max-w-md text-center border border-gray-200 mt-10">
                    <h2 className="text-3xl font-black text-gray-800 mb-2">Apertura de Caja</h2>
                    <p className="text-gray-500 mb-8">Ingresa el fondo inicial para comenzar tu turno.</p>
                    
                    <div className="text-left mb-8">
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Fondo Inicial:</label>
                        <div className="relative">
                            <span className="absolute left-4 top-3 text-gray-400 font-bold text-xl">$</span>
                            <input 
                                type="number" 
                                value={fondoInicial}
                                onChange={(e) => setFondoInicial(e.target.value)}
                                className="w-full pl-10 p-3 border-2 border-gray-400 rounded-full focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none text-2xl font-black text-gray-700 transition-all"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <button 
                        onClick={handleAbrirCaja}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-4 rounded-full shadow-lg transition-transform active:scale-95 text-xl"
                    >
                        ABRIR CAJA 
                    </button>
                </div>
            ) : (
                /* ========================================================
                   VISTA 2: CIERRE DE CAJA (DISEÑO MAQUETA)
                   ======================================================== */
                <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-5xl border border-gray-300 mt-6">
                    
                    <h2 className="text-3xl font-black text-gray-800 text-center mb-10 tracking-wide">CIERRE DE CAJA</h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                        
                        {/* COLUMNA IZQUIERDA: VALORES DEL SISTEMA */}
                        <div className="flex flex-col justify-center">
                            
                            <div className="flex justify-between items-center py-4 border-b border-gray-300">
                                <span className="text-xl font-bold text-gray-700">Fondo Inicial:</span>
                                <span className="text-2xl font-black text-gray-600">${parseFloat(sesionActiva.fondo_inicial).toFixed(2)}</span>
                            </div>
                            
                            <div className="flex justify-between items-center py-4 border-b border-gray-300">
                                <span className="text-xl font-bold text-gray-700">Ventas en Efectivo:</span>
                                <span className="text-2xl font-black text-gray-600">${parseFloat(sesionActiva.ventas_efectivo).toFixed(2)}</span>
                            </div>

                            <div className="flex justify-between items-center py-4 border-b border-gray-300 mb-6">
                                <span className="text-xl font-bold text-gray-700">Ventas con Tarjeta:</span>
                                <span className="text-2xl font-black text-gray-600">${parseFloat(sesionActiva.ventas_tarjeta).toFixed(2)}</span>
                            </div>

                            <div className="text-center mt-2">
                                <span className="text-xl font-bold text-gray-800 mb-2 block">Total Esperado en Caja</span>
                                <div className="border-2 border-gray-300 py-4 px-6">
                                    <span className="text-5xl font-black text-orange-600 tracking-tight">
                                        ${parseFloat(sesionActiva.total_esperado).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* COLUMNA DERECHA: ENTRADA DEL CAJERO */}
                        <div className="flex flex-col justify-center border-l-0 lg:border-l-4 border-gray-300 lg:pl-16">
                            
                            {/* Input Efectivo */}
                            <div className="mb-8">
                                <label className="block text-xl font-bold text-gray-800 mb-3">Contador de Efectivo</label>
                                <div className="relative">
                                    <span className="absolute left-6 top-3 text-gray-600 font-bold text-2xl">$</span>
                                    <input 
                                        type="number" 
                                        value={conteoEfectivo}
                                        onChange={(e) => setConteoEfectivo(e.target.value)}
                                        className="w-full pl-12 pr-6 py-3 border-2 border-gray-600 rounded-full focus:border-orange-500 outline-none text-right font-bold text-2xl text-gray-800"
                                        placeholder="0.00"
                                    />
                                </div>
                                <p className={`mt-2 text-sm font-bold ${diffEfectivo >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                    Diferencia de Efectivo: {diffEfectivo >= 0 ? '+' : ''}${diffEfectivo.toFixed(2)}
                                </p>
                            </div>

                            {/* Input Tarjeta */}
                            <div>
                                <label className="block text-xl font-bold text-gray-800 mb-3">Voucher de Tarjetas</label>
                                <div className="relative">
                                    <span className="absolute left-6 top-3 text-gray-600 font-bold text-2xl">$</span>
                                    <input 
                                        type="number" 
                                        value={conteoTarjeta}
                                        onChange={(e) => setConteoTarjeta(e.target.value)}
                                        className="w-full pl-12 pr-6 py-3 border-2 border-gray-600 rounded-full focus:border-orange-500 outline-none text-right font-bold text-2xl text-gray-800"
                                        placeholder="0.00"
                                    />
                                </div>
                                <p className={`mt-2 text-sm font-bold ${diffTarjeta >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                    Diferencia de Tarjeta: {diffTarjeta >= 0 ? '+' : ''}${diffTarjeta.toFixed(2)}
                                </p>
                            </div>

                        </div>
                    </div>

                    {/* ========================================================
                        FOOTER: ESTATUS Y BOTONES
                        ======================================================== */}
                    <div className="mt-12 pt-8 border-t-4 border-gray-300 flex flex-col md:flex-row justify-between items-center gap-6">
                        
                        {/* ESTADO DE LA CAJA */}
                        <div className="flex items-center gap-6">
                            {diffTotal === 0 ? (
                                <>
                                    <div className="bg-green-600 w-16 h-16 rounded-xl flex items-center justify-center shadow-lg">
                                        <FaCheck className="text-white text-3xl" />
                                    </div>
                                    <span className="text-3xl font-black text-gray-700">Caja Cuadrada</span>
                                </>
                            ) : diffTotal < 0 ? (
                                <>
                                    <div className="bg-red-600 w-16 h-16 rounded-xl flex items-center justify-center shadow-lg">
                                        <FaTimes className="text-white text-4xl font-light" />
                                    </div>
                                    <span className="text-3xl font-black text-gray-700">FALTANTE: <span className="text-red-600">-${Math.abs(diffTotal).toFixed(2)}</span></span>
                                </>
                            ) : (
                                <>
                                    <div className="bg-orange-500 w-16 h-16 rounded-xl flex items-center justify-center shadow-lg">
                                        <FaInfo className="text-white text-3xl" />
                                    </div>
                                    <span className="text-3xl font-black text-gray-700">Sobrante: <span className="text-orange-500">+${diffTotal.toFixed(2)}</span></span>
                                </>
                            )}
                        </div>

                        {/* BOTONES DE ACCIÓN */}
                        <div className="flex items-center gap-4 w-full md:w-auto border-l-0 md:border-l-4 border-gray-300 md:pl-8">
                            {/* <button 
                                onClick={handleImprimirPreCorte}
                                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors text-lg flex-1 md:flex-none"
                            >
                                Imprimir Pre-corte
                            </button> */}


                            <button 
                                onClick={() => navigate('/caja')} 
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg transition-colors text-lg flex-1 md:flex-none shadow-sm"
                            >
                                Volver a la Caja
                            </button>
                            <button 
                                onClick={handleCerrarCaja}
                                className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg transition-colors text-lg shadow-lg shadow-orange-300 flex-1 md:flex-none"
                            >
                                Cerrar Turno
                            </button>
                        </div>
                        
                    </div>

                </div>
            )}
        </div>
    );
};

export default GestionCaja;