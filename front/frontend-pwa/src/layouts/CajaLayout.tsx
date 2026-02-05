import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { FaPowerOff, FaCashRegister } from 'react-icons/fa';
import gabunniLogo from '../assets/gabunniLogo.jpg'; // Asegúrate de que la ruta sea correcta

const CajaLayout: React.FC = () => {
    const { isAuthenticated, logout, getUserRole, user } = useAuth(); // Asumo que 'user' trae datos como username
    const navigate = useNavigate();
    const userRole = getUserRole();

    // Protección de ruta
    React.useEffect(() => {
        if (!isAuthenticated || (userRole !== 'cajero' && userRole !== 'admin')) {
            navigate('/login');
        }
    }, [isAuthenticated, userRole, navigate]);

    if (!isAuthenticated) return null;

    return (
        <div className="flex flex-col h-screen bg-white">
            {/* --- HEADER SUPERIOR --- */}
            <header className="flex justify-between items-center px-8 py-4 bg-white shadow-sm border-b border-gray-100 h-20 shrink-0">
                {/* 1. Logo */}
                <div className="flex items-center cursor-pointer" onClick={() => navigate('/caja/terminal')}>
                    <img src={gabunniLogo} alt="Gabunni" className="h-12 w-auto object-contain" />
                </div>

                {/* 2. Zona Derecha: Nombre y Botones */}
                <div className="flex items-center gap-6">
                    <p className="text-gray-500 font-medium">
                        Cajero: <span className="text-gray-800 font-bold">{user?.username || 'Cajero 1'}</span>
                    </p>

                    <button 
                        onClick={() => navigate('/caja/gestion')}
                        className="bg-gray-700 hover:bg-gray-800 text-white px-6 py-2 rounded-full font-medium transition-colors flex items-center gap-2"
                    >
                        <FaCashRegister /> Corte de Caja
                    </button>

                    <button 
                        onClick={logout}
                        className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full font-medium transition-colors flex items-center gap-2"
                    >
                        <FaPowerOff /> Salir
                    </button>
                </div>
            </header>

            {/* --- CONTENIDO PRINCIPAL --- */}
            <main className="flex-1 overflow-hidden bg-gray-50 relative">
                <Outlet />
            </main>
        </div>
    );
};

export default CajaLayout;