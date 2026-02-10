import React, { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

import { KioscoProvider } from '../context/KioscoContext';

const KioscoLayout: React.FC = () => {
    const { isAuthenticated, getUserRole, logout } = useAuth();
    const role = getUserRole();
    
    const [tapCount, setTapCount] = useState(0);

    useEffect(() => {
        if (tapCount === 0) return;

        const timer = setTimeout(() => {
            setTapCount(0);
        }, 1500);

        return () => clearTimeout(timer);
    }, [tapCount]);

    const handleSecretExit = () => {
        const nextCount = tapCount + 1;
        
        if (nextCount >= 3) {
           
            if (window.confirm("  ¿Deseas cerrar la sesión del Kiosco?")) {
                logout();
            }
            setTapCount(0); 
        } else {
            setTapCount(nextCount);
        }
    };

    if (!isAuthenticated || (role !== 'kiosco' && role !== 'admin')) {
        return <Navigate to="/login" />;
    }

    return (

        <KioscoProvider>


            <div className="h-screen w-screen bg-white overflow-hidden select-none font-sans relative">
                
                <Outlet />

                
                <div 
                    onClick={handleSecretExit}
                    className="fixed bottom-0 right-0 w-20 h-20 z-50 cursor-default"
                    /* className="fixed bottom-0 right-0 w-20 h-20 z-50 bg-red-500 opacity-50" */ 
                    title="Boton de cerrar sesión"
                    />
            </div>

        </KioscoProvider>
    );
};

export default KioscoLayout;