import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { FaCashRegister, FaWallet, FaSignOutAlt, FaHome } from 'react-icons/fa';

const CajaLayout: React.FC = () => {
    const { isAuthenticated, logout, getUserRole } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const userRole = getUserRole();

    // Protección de Ruta: Solo Cajeros y Admins
    React.useEffect(() => {
        if (!isAuthenticated || (userRole !== 'cajero' && userRole !== 'admin')) {
            navigate('/login');
        }
    }, [isAuthenticated, userRole, navigate]);

    if (!isAuthenticated) return null;

    const navItems = [
        { name: 'Terminal TPV', path: '/caja/terminal', icon: FaCashRegister },
        { name: 'Gestión de Caja', path: '/caja/gestion', icon: FaWallet },
    ];

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* --- Sidebar Cajero --- */}
            <aside className="w-64 bg-gray-900 text-white flex flex-col shadow-2xl shrink-0">
                <div className="p-6 border-b border-gray-800">
                    <h1 className="text-2xl font-extrabold text-green-500">GABUNNI POS 💵</h1>
                    <p className='text-sm text-gray-400 mt-1'>
                        Hola, {userRole?.charAt(0).toUpperCase() + userRole?.slice(1)}
                    </p>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map(item => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center p-3 rounded-lg transition-all duration-200 font-bold
                                ${location.pathname === item.path
                                    ? 'bg-green-600 text-white shadow-lg translate-x-1'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`}
                        >
                            <item.icon className="mr-3 text-xl" />
                            <span>{item.name}</span>
                        </Link>
                    ))}
                    
                    {/* Botón especial para volver al Admin si eres Admin */}
                    {userRole === 'admin' && (
                         <Link to="/admin" className="flex items-center p-3 text-orange-400 hover:bg-gray-800 rounded-lg mt-10 border border-dashed border-gray-700">
                            <FaHome className="mr-3" /> Volver al Admin
                         </Link>
                    )}
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center p-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-md font-bold"
                    >
                        <FaSignOutAlt className="mr-2" /> Cerrar Turno
                    </button>
                </div>
            </aside>

            {/* --- Contenido Principal --- */}
            <main className="flex-1 overflow-y-auto p-6 bg-gray-100">
                <Outlet />
            </main>
        </div>
    );
};

export default CajaLayout;