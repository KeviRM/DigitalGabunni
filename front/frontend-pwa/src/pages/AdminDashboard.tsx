import React, { useState, useEffect } from 'react';
import { pedidosApi } from '../api/axiosConfig';
import { FaMoneyBillWave, FaShoppingCart, FaChartLine, FaTimesCircle, FaClock, FaFire } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'; 
import useAuth from '../hooks/useAuth';

const ANALYTICS_API_URL = '/api/v1/pedidos/analytics/';

// Paleta de colores para las gráficas de pastel
const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6'];

export default function AdminDashboard() {
    const { getAuthHeaders, isAuthenticated } = useAuth();
    const [data, setData] = useState<any>(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            if (!isAuthenticated) return;
            setCargando(true);
            try {
                const response = await pedidosApi.get(ANALYTICS_API_URL, { headers: getAuthHeaders() });
                setData(response.data);
            } catch (err) {
                console.error("Error al cargar analítica:", err);
            } finally {
                setCargando(false);
            }
        };
        fetchAnalytics();
    }, [isAuthenticated]);

    if (!isAuthenticated) return null; 
    if (cargando) return <div className="flex h-screen items-center justify-center text-2xl font-bold text-gray-500 animate-pulse">Cargando Analíticas...</div>;

    // Esto protegerá la vista si el backend falla o manda los datos mal formateados
if (!data || !data.metricas) {
    console.log("Datos recibidos del servidor:", data);
    return <div className="text-center p-20 text-red-500 font-bold">Error: El servidor no envió las métricas. Revisa la consola (F12) o la terminal de Django.</div>;
}
    const { metricas, grafica_diaria, grafica_origen, grafica_delivery, grafica_tipos, top_extras, top_sin } = data;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-4xl font-black text-gray-800 border-b-4 border-orange-500 pb-2 mb-8 inline-block">Métricas de Gabunni</h1>
            
            {/* --- 1. TARJETAS DE MÉTRICAS GLOBALES --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-b-4 border-gray-300 relative overflow-hidden group">
                    <FaMoneyBillWave className="absolute -right-4 -bottom-4 text-7xl text-green-500 opacity-30 group-hover:scale-110 transition-transform" />
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Ganancia (30 Días)</p>
                    <p className="text-3xl mt-2 font-black text-green-600">${metricas.ganancia_ultimos_dias.toFixed(2)}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-b-4 border-gray-300 relative overflow-hidden group">
                    <FaShoppingCart className="absolute -right-4 -bottom-4 text-7xl text-blue-500 opacity-30 group-hover:scale-110 transition-transform" />
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Órdenes (30 Días)</p>
                    <p className="text-3xl mt-2 font-black text-blue-600">{metricas.ordenes_ultimos_dias}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-b-4 border-gray-300 relative overflow-hidden group">
                    <FaClock className="absolute -right-4 -bottom-4 text-7xl text-yellow-500 opacity-30 group-hover:scale-110 transition-transform" />
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Pendientes / Cocina</p>
                    <p className="text-3xl mt-2 font-black text-yellow-600">{metricas.pendientes_actuales}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-b-4 border-gray-300 relative overflow-hidden group">
                    <FaTimesCircle className="absolute -right-4 -bottom-4 text-7xl text-red-500 opacity-30 group-hover:scale-110 transition-transform" />
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Cancelados</p>
                    <p className="text-3xl mt-2 font-black text-red-600">{metricas.cancelados_recientes}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 bg-linear-to-br from-orange-500 to-orange-600 text-white shadow-orange-200">
                    <p className="text-sm font-bold opacity-80 uppercase tracking-wider">Ventas Históricas</p>
                    <p className="text-3xl mt-2 font-black">${metricas.ganancia_total_historica.toFixed(2)}</p>
                </div>
            </div>
            
            {/* --- 2. GRÁFICAS DE DISTRIBUCIÓN (DONUTS) --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Ingresos por Origen */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
                    <h2 className="text-lg font-bold text-gray-700 w-full mb-2">Ingresos por Canal</h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie data={grafica_origen} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                {grafica_origen.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Ingresos por Tipo de Entrega */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
                    <h2 className="text-lg font-bold text-gray-700 w-full mb-2">Tipo de Consumo</h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie data={grafica_delivery} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                {grafica_delivery.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />)}
                            </Pie>
                            <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Popularidad de Tipo de Producto */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
                    <h2 className="text-lg font-bold text-gray-700 w-full mb-2">Tipos de Productos Vendidos</h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie data={grafica_tipos} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                {grafica_tipos.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />)}
                            </Pie>
                            <Tooltip formatter={(value) => `${value} unidades`} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* --- 3. GRÁFICA PRINCIPAL Y TOP INGREDIENTES --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Gráfica de Barras Diaria */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <FaChartLine className="text-orange-500" /> Tendencia de Ganancias (30 Días)
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={grafica_diaria} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="dia" axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
                            <Tooltip cursor={{fill: '#fff7ed'}} formatter={(value: number) => [`$${value.toFixed(2)}`, 'Ingreso']} />
                            <Bar dataKey="ganancia" fill="#f97316" radius={[6, 6, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Ranking de Ingredientes */}
                <div className="space-y-6">
                    {/* Top Agregados */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="bg-green-100 text-green-600 p-2 rounded-lg"><FaFire /></span>
                            Top Ingredientes Agregados
                        </h3>
                        <div className="space-y-3">
                            {top_extras.length === 0 ? <p className="text-gray-400 text-sm">No hay datos</p> : 
                                top_extras.map((ing: any, i: number) => (
                                <div key={i} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                                    <span className="font-bold text-gray-600">{i+1}. {ing.name}</span>
                                    <span className="bg-gray-100 text-gray-800 font-black px-2 py-1 rounded-md">{ing.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Rechazados (SIN) */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="bg-red-100 text-red-600 p-2 rounded-lg"><FaTimesCircle /></span>
                            Más Rechazados (Sin...)
                        </h3>
                        <div className="space-y-3">
                            {top_sin.length === 0 ? <p className="text-gray-400 text-sm">Nadie ha quitado nada aún</p> : 
                                top_sin.map((ing: any, i: number) => (
                                <div key={i} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                                    <span className="font-bold text-gray-600">{i+1}. {ing.name}</span>
                                    <span className="bg-red-50 text-red-600 font-black px-2 py-1 rounded-md">{ing.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
