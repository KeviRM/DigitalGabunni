import React, { useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";

import { FaGift, FaBoxOpen, FaMailBulk , FaInfo , FaClipboardList, FaRuler, FaUsers, FaSignOutAlt, FaUtensils, FaChartLine, FaFileAlt, FaChevronDown, FaChevronUp } from 'react-icons/fa';

interface NavItem {
    name: string;
    path: string;
    icon: React.ElementType;
    role: 'admin' | 'cocinero';
}

interface NavGroup {
    title: string;
    items: NavItem[];
}

const ADMIN_NAV_GROUPS: NavGroup[] = [
    {
        title: "Principal",
        items: [
            { name: 'Dashboard', path: '/admin/dashboard', icon: FaChartLine, role: 'admin' },
            { name: 'Pedidos', path: '/admin/pedidos', icon: FaClipboardList, role: 'admin' },
            { name: 'Reportes', path: '/admin/reportes', icon: FaFileAlt, role: 'admin' },
        ]
    },
    {
        title: "Cocina",
        items: [
            { name: 'Comandas', path: '/admin/cocina', icon: FaUtensils, role: 'cocinero' },
        ]
    },
    {
        title: "Catálogo",
        items: [
            { name: 'Productos', path: '/admin/catalogo', icon: FaBoxOpen, role: 'admin' },
            { name: 'Ingredientes', path: '/admin/ingredientes', icon: FaUtensils, role: 'admin' },
            { name: 'Recetas', path: '/admin/recetas', icon: FaBoxOpen, role: 'admin' },
            { name: 'Paquetes', path: '/admin/paquetes', icon: FaGift, role: 'admin' },
            { name: 'Unidades', path: '/admin/unidades', icon: FaRuler, role: 'admin' },
            { name: 'Categorías', path: '/admin/categorias', icon: FaClipboardList, role: 'admin' },
        ]
    },
    {
        title: "Usuarios",
        items: [
            { name: 'Gestión Usuarios', path: '/admin/usuarios', icon: FaUsers, role: 'admin' },
        ]
    },
    {
        title: "Contactos",
        items:[
            { name: 'Mensajes', path: '/admin/mensajes', icon: FaMailBulk, role: 'admin' },
            { name: 'Datos', path: '/admin/contenido', icon: FaInfo, role: 'admin' }
        ]
    }
];

const AdminLayout: React.FC = () => {
    const { isAuthenticated, logout, getUserRole } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const userRole = getUserRole();
    const [openGroups, setOpenGroups] = useState<{ [key: string]: boolean }>({
        "Principal": true,
        "Cocina": true,
        "Catálogo": true,
        "Usuarios": true
    });

    if (!isAuthenticated || !userRole || (userRole !== 'admin' && userRole !== 'cocinero')) {
        navigate('/login');
        return null;
    }

    const toggleGroup = (title: string) => {
        setOpenGroups(prev => ({ ...prev, [title]: !prev[title] }));
    };

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* --- Sidebar --- */}
            <aside className="w-64 bg-gray-800 text-white flex flex-col shadow-2xl shrink-0">
                <div className="p-6 border-b border-gray-700 shrink-0">
                    <h1 className="text-2xl font-extrabold text-orange-400">GABUNNI ADMIN</h1>
                    <p className='text-sm text-gray-400 mt-1'>Rol: {userRole.charAt(0).toUpperCase() + userRole.slice(1)}</p>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {ADMIN_NAV_GROUPS.map(group => {
                        const filteredItems = group.items.filter(item =>
                            item.role === 'admin' || (userRole === 'cocinero' && item.role === 'cocinero')
                        );

                        if (filteredItems.length === 0) return null;

                        return (
                            <div key={group.title}>
                                <button
                                    onClick={() => toggleGroup(group.title)}
                                    className="flex items-center justify-between w-full text-gray-400 hover:text-white mb-2 text-xs font-bold uppercase tracking-wider"
                                >
                                    {group.title}
                                    {openGroups[group.title] ? <FaChevronUp /> : <FaChevronDown />}
                                </button>

                                {openGroups[group.title] && (
                                    <div className="space-y-1">
                                        {filteredItems.map(item => (
                                            <Link
                                                key={item.name}
                                                to={item.path}
                                                className={`flex items-center p-2 rounded-lg transition-colors duration-200 
                                                    ${location.pathname === item.path
                                                        ? 'bg-orange-600 text-white shadow-md font-semibold'
                                                        : 'hover:bg-gray-700 text-gray-300'}`
                                                }
                                            >
                                                <item.icon className="mr-3 text-lg" />
                                                <span className='text-sm'>{item.name}</span>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-700 shrink-0">
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
            <main className="flex-1 overflow-y-auto p-6">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;