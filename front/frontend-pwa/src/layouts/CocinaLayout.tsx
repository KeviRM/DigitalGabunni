import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { FaPowerOff } from 'react-icons/fa';
import gabunniLogo from '../assets/gabunniLogo.jpg'; // Asegúrate de que la ruta sea correcta

const CocinaLayout: React.FC = () => {
    const { isAuthenticated, logout, getUserRole } = useAuth();
    const navigate = useNavigate();
    const userRole = getUserRole();

    // Protección de ruta
    React.useEffect(() => {
        if (!isAuthenticated || (userRole !== 'cocinero' && userRole !== 'admin')) {
            navigate('/login');
        }
    }, [isAuthenticated, userRole, navigate]);

    if (!isAuthenticated) return null;

    return (
        <div className="flex flex-col h-screen bg-white">
            {/* --- HEADER SUPERIOR --- */}
            <header className="flex justify-between items-center px-8 py-4 bg-white shadow-sm border-b-3 border-orange-300 h-20 shrink-0">
                {/* Logo */}
                <div className="flex items-center cursor-pointer" onClick={() => navigate('/caja/terminal')}>
                    <img src={gabunniLogo} alt="Gabunni" className="h-12 w-auto object-contain" />
                </div>

                {/*  Nombre y Botones */}
                <div className="flex items-center gap-6">
                    <button 
                        onClick={logout}
                        className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-3xl font-medium transition-colors flex items-center gap-2"
                    >
                        <FaPowerOff /> Salir
                    </button>
                </div>
            </header>

            {/* --- CONTENIDO PRINCIPAL --- */}
            <main className="flex-1 bg-gray-50 relative">
                <Outlet />
            </main>
        </div>
    );
};

export default CocinaLayout;