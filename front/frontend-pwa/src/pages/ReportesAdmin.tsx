// frontend-pwa/src/pages/ReportesAdmin.tsx
import React, { useState } from 'react';


import { pedidosApi } from '../api/axiosConfig';


import useAuth from '../hooks/useAuth';
import { FaFileCsv, FaDownload, FaCalendarAlt } from 'react-icons/fa';

const REPORTES_API_URL = '/api/v1/reportes/ventas/';

const ReportesAdmin: React.FC = () => {
    const { getAuthHeaders } = useAuth();
    const [fechas, setFechas] = useState({ inicio: '', fin: '' });
    const [cargando, setCargando] = useState(false);

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

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <h1 className="text-4xl font-extrabold text-gray-800 mb-8 border-b-4 border-blue-600 pb-2 max-w-4xl mx-auto">
                Generador de Reportes 
            </h1>

            <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg">
                <div className="flex items-center mb-6 text-gray-700">
                    <FaFileCsv className="text-5xl text-green-600 mr-4" />
                    <div>
                        <h2 className="text-2xl font-bold">Reporte de Ventas (CSV)</h2>
                        <p className="text-sm">Descarga un archivo compatible con Excel con el detalle de todas las ventas.</p>
                    </div>
                </div>

                <form onSubmit={handleDownload} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h3 className="font-semibold mb-4 flex items-center">
                        <FaCalendarAlt className="mr-2" /> Filtrar por Fecha (Opcional)
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
                            <input 
                                type="date" 
                                value={fechas.inicio}
                                onChange={(e) => setFechas({...fechas, inicio: e.target.value})}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
                            <input 
                                type="date" 
                                value={fechas.fin}
                                onChange={(e) => setFechas({...fechas, fin: e.target.value})}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={cargando}
                        className={`w-full py-4 rounded-lg font-bold text-white flex items-center justify-center text-lg transition-colors ${
                            cargando ? 'bg-gray-400 cursor-wait' : 'bg-blue-600 hover:bg-blue-700 shadow-md'
                        }`}
                    >
                        {cargando ? 'Generando...' : (
                            <>
                                <FaDownload className="mr-2" /> Descargar Reporte
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ReportesAdmin;