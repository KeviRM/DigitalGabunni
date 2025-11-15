// frontend-pwa/src/pages/AdminDashboard.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaClipboardList, FaFire, FaBoxOpen, FaRuler, FaUtensils, FaSignOutAlt } from 'react-icons/fa';
import useAuth from '../hooks/useAuth';

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated, logout } = useAuth();

    if (!isAuthenticated) {
        return <div className="text-center p-20 text-red-500">Acceso no autorizado. Por favor, inicia sesión.</div>;
    }

    const adminOptions = [
        { name: 'Pedidos y Comandas', path: '/admin/pedidos', icon: FaClipboardList, description: 'Ver y actualizar el estado de los pedidos de los clientes.' },
        { name: 'Gestión de Catálogo', path: '/admin/catalogo', icon: FaBoxOpen, description: 'Crear, editar y eliminar productos, precios e imágenes.' },
        { name: 'Definir Recetas', path: '/admin/recetas', icon: FaUtensils, description: 'Asignar ingredientes fijos y cantidades a las chapatas establecidas.' },
        { name: 'Unidades de Medida', path: '/admin/unidades', icon: FaRuler, description: 'Gestionar las unidades (g, porción, ml) para los ingredientes.' },
        { name: 'Gestión de Ingredientes', path: '/admin/ingredientes', icon: FaUtensils, description: 'Gestionar ingredientes, asignar clases y unidades de medida.' },
        { name: 'Comandas de Cocina', path: '/admin/cocina', icon: FaFire, description: 'Panel visual para cocinar y avanzar pedidos a "Listo".' },
    ];

    return (
        <div className="min-h-screen bg-gray-100 p-6 md:p-10">
            <div className="max-w-6xl mx-auto">
                <div className='flex justify-between items-center mb-8 border-b pb-3'>
                    <h1 className="text-4xl font-extrabold text-gray-800">Panel de Administración</h1>
                    <button
                        onClick={logout}
                        className="flex items-center text-sm font-semibold text-red-600 hover:text-red-800"
                    >
                        <FaSignOutAlt className='mr-1' /> Cerrar Sesión
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {adminOptions.map(option => (
                        <Link 
                            key={option.name} 
                            to={option.path}
                            className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex items-center space-x-4 border-l-4 border-orange-500"
                        >
                            <option.icon className="text-orange-500 text-3xl" />
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{option.name}</h2>
                                <p className="text-sm text-gray-500 mt-1">{option.description}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;