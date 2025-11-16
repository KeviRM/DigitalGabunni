import React from 'react';

const AdminDashboard: React.FC = () => {

    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold text-gray-800 border-b pb-2 mb-6">Panel Principal de Control (Dashboard)</h1>
            
            {/* --- Sección de Gráficas y Métricas (Futura Implementación) --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-semibold text-green-600">Ganancias del Mes</h2>
                    <p className="text-4xl mt-2">$25,450.00</p>
                    <p className="text-sm text-gray-500">vs. Mes anterior (+12%)</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-semibold text-orange-600">Pedidos Totales</h2>
                    <p className="text-4xl mt-2">1,250</p>
                    <p className="text-sm text-gray-500">Pedidos activos: 8</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-semibold text-blue-600">Chapata más Vendida</h2>
                    <p className="text-2xl mt-2">Chapata de Pollo Ranch</p>
                    <p className="text-sm text-gray-500">Vendidas: 350 unidades</p>
                </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">¡Bienvenido al Panel de Administración!</h2>
                <p className="text-gray-600">Usa el menú lateral para gestionar pedidos, catálogo y usuarios.</p>
                {/* Aquí se integrarán las gráficas avanzadas en la Fase 2 */}
            </div>
        </div>
    );
};

export default AdminDashboard;