import React from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";

import { FaGift, FaBoxOpen, FaClipboardList, FaRuler, FaUsers, FaSignOutAlt, FaUtensils, FaChartLine, FaFileAlt } from 'react-icons/fa';



interface NavItem {
    name: string;
    path: string;
    icon: React.ElementType;
    role: 'admin' | 'cocinero';
}




const ADMIN_NAV_ITEMS: NavItem[] = [

    { name: 'Dashboard (Gráficas)', path: '/admin/dashboard', icon: FaChartLine, role: 'admin' },
    { name: 'Pedidos (Gestión)', path: '/admin/pedidos', icon: FaClipboardList, role: 'admin' },
    { name: 'Reportes y Ventas', path: '/admin/reportes', icon: FaFileAlt, role: 'admin' },
    { name: 'Comandas (Cocina)', path: '/admin/cocina', icon: FaUtensils, role: 'cocinero' },
    { name: 'Gestión de Catálogo', path: '/admin/catalogo', icon: FaBoxOpen, role: 'admin' },
    { name: 'Gestión de Ingredientes', path: '/admin/ingredientes', icon: FaUtensils, role: 'admin' },
    { name: 'Unidades de Medida', path: '/admin/unidades', icon: FaRuler, role: 'admin' },
    { name: 'Gestión de Recetas', path: '/admin/recetas', icon: FaBoxOpen, role: 'admin' },
    { name: 'Gestión de Paquetes', path: '/admin/paquetes', icon: FaGift, role: 'admin' },
    { name: 'Gestión de Usuarios', path: '/admin/usuarios', icon: FaUsers, role: 'admin' },

];


const AdminLayout: React.FC = () =>{
    const { isAuthenticated, logout, getUserRole} = useAuth();
    const navigate = useNavigate();
    const location = useLocation();


    const userRole = getUserRole();


    if (!isAuthenticated || !userRole || (userRole !== 'admin' && userRole !== 'cocinero')){
        navigate('/login');
        return null;
    }

    const filteredNavItems = ADMIN_NAV_ITEMS.filter(item =>
        item.role === 'admin' || (userRole === 'cocinero' && item.role === 'cocinero')
    );



    return(


        <div className="flex min-h-screen bg-gray-100">


        {/* --- Sidebar --- */}
            <aside className="w-64 bg-gray-800 text-white flex flex-col fixed h-full shadow-2xl">
                <div className="p-6 border-b border-gray-700">
                    <h1 className="text-2xl font-extrabold text-orange-400">GABUNNI ADMIN</h1>
                    <p className='text-sm text-gray-400 mt-1'>Rol: {userRole.charAt(0).toUpperCase() + userRole.slice(1)}</p>
                </div>
                
                <nav className="grow p-4 space-y-2">
                    {filteredNavItems.map(item => (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`flex items-center p-3 rounded-lg transition-colors duration-200 
                                ${location.pathname === item.path 
                                    ? 'bg-orange-600 text-white shadow-md font-semibold' 
                                    : 'hover:bg-gray-700 text-gray-300'}`
                            }
                        >
                            <item.icon className="mr-3 text-lg" />
                            <span className='text-sm'>{item.name}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-700">
                    <button
                        onClick={logout}
                        className="w-full flex items-center p-3 text-red-400 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                    >
                        <FaSignOutAlt className="mr-3 text-lg" />
                        <span className='text-sm'>Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* --- Contenido Principal --- */}
            <main className="flex-1 ml-64 p-6"> {/* El 'ml-64' empuja el contenido para dejar espacio al sidebar fijo */}
                <Outlet /> {/* Aquí se renderizarán los componentes de la sub-ruta (/admin/pedidos, /admin/catalogo, etc.) */}
            </main>




        </div>




    );





};

export default AdminLayout;