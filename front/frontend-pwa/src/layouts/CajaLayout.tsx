import React, { useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { FaSignOutAlt } from 'react-icons/fa';



const CajaLayout: React.FC = () => {
    const { isAuthenticated, logout, getUserRole } = useAuth();
    const navigate = useNavigate();
    const userRole = getUserRole();


    if (!isAuthenticated || !userRole || (userRole !== 'admin' && userRole !== 'cocinero')) {
        navigate('/login');
        return null;
    }

    

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* --- Sidebar --- */}
            <aside className="w-64 bg-gray-800 text-white flex flex-col shadow-2xl shrink-0">
                <div className="p-6 border-b border-gray-700 shrink-0">
                    <h1 className="text-2xl font-extrabold text-orange-400">GABUNNI Caja</h1>
                    <p className='text-sm text-gray-400 mt-1'>Rol: {userRole.charAt(0).toUpperCase() + userRole.slice(1)}</p>
                </div>


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

export default CajaLayout;