// frontend-pwa/src/pages/ReportesAdmin.tsx
import React, { useState } from 'react';


import { pedidosApi } from '../api/axiosConfig';


import useAuth from '../hooks/useAuth';
import { FaFileCsv, FaDownload, FaCalendarAlt, FaCashRegister } from 'react-icons/fa';

const REPORTES_API_URL = '/api/v1/pedidos/reportes/ventas/';

const ReportesAdmin: React.FC = () => {
    const { getAuthHeaders } = useAuth();
    const [fechas, setFechas] = useState({ inicio: '', fin: '' });
    const [cargando, setCargando] = useState(false);

    const [cargandoCortes, setCargandoCortes] = useState(false);

    const handleDownload = async (e: React.FormEvent) => {
        e.preventDefault();
        setCargando(true);
        
        try {
            const AUTH_HEADERS = { 
                headers: getAuthHeaders(), 
                responseType: 'blob' as 'json' // CRÍTICO: Importante para descargar archivos binarios
            };

            // Construir URL con parámetros
            const params = new URLSearchParams();
            if (fechas.inicio) params.append('fecha_inicio', fechas.inicio);
            if (fechas.fin) params.append('fecha_fin', fechas.fin);

            const response = await pedidosApi.get(`${REPORTES_API_URL}?${params.toString()}`, AUTH_HEADERS);

            // Crear un enlace invisible para forzar la descarga del archivo (Blob)
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            
            // Extraer nombre de archivo sugerido o usar uno por defecto
            link.setAttribute('download', `reporte_ventas_${new Date().toISOString().slice(0,10)}.csv`);
            
            document.body.appendChild(link);
            link.click();
            
            // Limpieza
            link.remove();
            window.URL.revokeObjectURL(url);

        } catch (err) {
            console.error("Error al descargar reporte:", err);
            alert("Hubo un error al generar el reporte.");
        } finally {
            setCargando(false);
        }
    };


    const handleDownloadCortes = async (e: React.FormEvent) => {
        e.preventDefault();
        setCargandoCortes(true);
        try {
            const AUTH_HEADERS = { headers: getAuthHeaders(), responseType: 'blob' as 'json' };
            const params = new URLSearchParams();
            if (fechas.inicio) params.append('fecha_inicio', fechas.inicio);
            if (fechas.fin) params.append('fecha_fin', fechas.fin);

            // Apuntamos al nuevo endpoint
            const response = await pedidosApi.get(`/api/v1/pedidos/reportes/cortes/?${params.toString()}`, AUTH_HEADERS);
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `auditoria_cajas_${new Date().toISOString().slice(0,10)}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Error al descargar reporte de cortes:", err);
            alert("Hubo un error al generar el reporte de cortes.");
        } finally {
            setCargandoCortes(false);
        }
    };



   return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-10">
            {/* Cabecera Principal */}
            <div className="max-w-7xl mx-auto mb-10">
                <h1 className="text-4xl font-black text-gray-800 border-b-4 border-orange-600 pb-3 inline-block">
                    Centro de Reportes
                </h1>
                <p className="text-gray-500 mt-2 font-medium">Descarga la información financiera y operativa en formato Excel (CSV).</p>
            </div>

            {/* Contenedor Grid (2 Columnas) */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* =========================================
                    TARJETA: REPORTE DE VENTAS 
                ========================================= */}
                <div className="bg-white p-8 rounded-2xl shadow-md border-x-4 border-gray-300 flex flex-col h-full hover:shadow-md transition-shadow">
                    <div className="flex items-start mb-6 border-b-2 border-gray-300 pb-4">
                        <div className="bg-green-100 p-4 rounded-xl mr-5">
                            <FaFileCsv className="text-4xl text-green-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-800">Reporte de Ventas</h2>
                            <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                                Detalle completo de cada orden: productos base, extras cobrados, ingredientes rechazados y método de pago.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleDownload} className="bg-gray-50/50 p-6 rounded-xl border border-gray-200 flex-1 flex flex-col justify-between">
                        <div>
                            <h3 className="font-bold text-gray-700 mb-4 flex items-center">
                                <FaCalendarAlt className="mr-2 text-blue-500" /> Rango de Fechas <span className="text-xs font-normal text-gray-400 ml-2">(Opcional)</span>
                            </h3>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Desde</label>
                                    <input 
                                        type="date" 
                                        value={fechas.inicio}
                                        onChange={(e) => setFechas({...fechas, inicio: e.target.value})}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-700 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Hasta</label>
                                    <input 
                                        type="date" 
                                        value={fechas.fin}
                                        onChange={(e) => setFechas({...fechas, fin: e.target.value})}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-700 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={cargando}
                            className={`w-full py-4 rounded-xl font-black text-white flex items-center justify-center text-lg transition-all transform active:scale-[0.98] ${
                                cargando ? 'bg-gray-400 cursor-wait' : 'bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200'
                            }`}
                        >
                            {cargando ? 'Generando Excel...' : (
                                <>
                                    <FaDownload className="mr-2" /> Descargar Ventas
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* =========================================
                    TARJETA : REPORTE DE CORTES / AUDITORÍA 
                ========================================= */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border-x-4 border-gray-300 flex flex-col h-full hover:shadow-md transition-shadow">
                    <div className="flex items-start mb-6 border-b-2 border-gray-300 pb-6">
                        <div className="bg-blue-100 p-4 rounded-xl mr-5">
                            <FaCashRegister className="text-4xl text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-800">Auditoría de Cajas</h2>
                            <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                                Historial financiero de turnos: fondos iniciales, ingresos declarados por el cajero vs sistema, y detección de faltantes.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleDownloadCortes} className="bg-gray-50/50 p-6 rounded-xl border border-gray-200 flex-1 flex flex-col justify-between">
                        <div>
                            <h3 className="font-bold text-gray-700 mb-4 flex items-center">
                                <FaCalendarAlt className="mr-2 text-blue-500" /> Rango de Fechas <span className="text-xs font-normal text-gray-400 ml-2">(Opcional)</span>
                            </h3>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Desde</label>
                                    <input 
                                        type="date" 
                                        value={fechas.inicio}
                                        onChange={(e) => setFechas({...fechas, inicio: e.target.value})}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-700 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Hasta</label>
                                    <input 
                                        type="date" 
                                        value={fechas.fin}
                                        onChange={(e) => setFechas({...fechas, fin: e.target.value})}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-700 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={cargandoCortes}
                            className={`w-full py-4 rounded-xl font-black text-white flex items-center justify-center text-lg transition-all transform active:scale-[0.98] ${
                                cargandoCortes ? 'bg-gray-400 cursor-wait' : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200'
                            }`}
                        >
                            {cargandoCortes ? 'Generando Excel...' : (
                                <>
                                    <FaDownload className="mr-2" /> Descargar Auditoría
                                </>
                            )}
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
};

export default ReportesAdmin;