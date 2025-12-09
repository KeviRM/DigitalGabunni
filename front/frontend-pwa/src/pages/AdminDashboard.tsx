// frontend-pwa/src/pages/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';

import { pedidosApi } from '../api/axiosConfig';

import { FaMoneyBillWave, FaShoppingCart, FaUsers, FaSpinner, FaChartLine } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'; // Componentes de Gráfica
import useAuth from '../hooks/useAuth';

const ANALYTICS_API_URL = '/api/v1/analytics/';

interface Metrics {
    ganancia_total_historica: number;
    ordenes_totales: number;
    ganancia_ultimos_dias: number;
    ordenes_ultimos_dias: number;
    clientes_activos: number;
}

const AdminDashboard: React.FC = () => {
    const { getAuthHeaders, isAuthenticated } = useAuth();
    const AUTH_HEADERS = { headers: getAuthHeaders() };

    const [metrics, setMetrics] = useState<Metrics | null>(null);
    const [graphData, setGraphData] = useState<any[]>([]);
    const [cargando, setCargando] = useState(true);

    const fetchAnalytics = async () => {
        if (!isAuthenticated) return;
        setCargando(true);
        try {
            const response = await pedidosApi.get(ANALYTICS_API_URL, AUTH_HEADERS);
            setMetrics(response.data.metricas);
            
            // Mapear los datos de la gráfica: el backend devuelve la fecha completa,
            // la acortamos para la etiqueta del eje X
            const formattedGraphData = response.data.grafica_diaria.map((item: any) => ({
                dia: item.dia.substring(5), // Mostrar solo MM-DD
                ganancia: item.ganancia
            }));
            setGraphData(formattedGraphData);
        } catch (err) {
            console.error("Error al cargar analítica:", err);
            // Manejar error 401/403 si el token expira
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchAnalytics();
        }
    }, [isAuthenticated]);

    if (!isAuthenticated) return null; // El Layout maneja la redirección
    if (cargando) return <div className="text-center p-20"><FaSpinner className="animate-spin text-3xl mx-auto" /> Cargando Datos...</div>;
    if (!metrics) return <div className="text-center p-20 text-gray-500">No hay datos disponibles para mostrar.</div>;

    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold text-gray-800 border-b pb-2 mb-6">Panel Principal de Control</h1>
            
            {/* --- Sección de Indicadores de Ventas (Métricas) --- */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                
                {/* Métrica 1: Ganancia Total Histórica */}
                <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-600">
                    <FaMoneyBillWave className='text-3xl text-green-600 mb-2' />
                    <p className="text-sm font-semibold text-gray-500">Ganancia Histórica</p>
                    <p className="text-3xl mt-1 font-bold">${metrics.ganancia_total_historica.toFixed(2)}</p>
                </div>
                
                {/* Métrica 2: Órdenes Totales */}
                <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-orange-500">
                    <FaShoppingCart className='text-3xl text-orange-500 mb-2' />
                    <p className="text-sm font-semibold text-gray-500">Órdenes Totales</p>
                    <p className="text-3xl mt-1 font-bold">{metrics.ordenes_totales}</p>
                </div>

                {/* Métrica 3: Ganancia Reciente (Últimos 30 días) */}
                <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-600">
                    <FaChartLine className='text-3xl text-blue-600 mb-2' />
                    <p className="text-sm font-semibold text-gray-500">Ganancia Reciente (30 días)</p>
                    <p className="text-3xl mt-1 font-bold">${metrics.ganancia_ultimos_dias.toFixed(2)}</p>
                </div>

                {/* Métrica 4: Clientes Activos (Proxy) */}
                <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-purple-600">
                    <FaUsers className='text-3xl text-purple-600 mb-2' />
                    <p className="text-sm font-semibold text-gray-500">Clientes Únicos (Proxy)</p>
                    <p className="text-3xl mt-1 font-bold">{metrics.clientes_activos}</p>
                </div>
            </div>
            
            {/* --- Sección de Gráficas Diarias --- */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Ganancias Diarias (Últimos 30 Días)</h2>
                
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={graphData} margin={{ top: 15, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="dia" />
                        <YAxis tickFormatter={(value) => `$${value.toFixed(0)}`} />
                        <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Ganancia']} />
                        <Bar dataKey="ganancia" fill="#f97316" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default AdminDashboard;