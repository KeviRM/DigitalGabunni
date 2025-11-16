// frontend-pwa/src/components/LoginModal.tsx
import React, { useState } from 'react';
import { FaUserCircle,  FaTimes } from 'react-icons/fa';
import useAuth from '../hooks/useAuth'; // Hook de autenticación JWT

interface LoginModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onSuccess }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    // Llamar a la lógica de Login con los credenciales
    const result = await login(username, password);

    if (result.success) {
            // Pasamos el rol para la redirección 
            onSuccess(result.role); 
        } else {
            setError('Credenciales inválidas. Por favor, verifica tu usuario y contraseña.'); 
        }
        setCargando(false);
    
  };

  return (
    <div className="fixed inset-0  bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl w-full max-w-sm p-6 shadow-2xl">
        
        <div className="flex justify-between items-center mb-6 border-b pb-2">
          <h2 className="text-2xl font-bold text-orange-500 flex items-center">
            <FaUserCircle className="mr-2 text-orange-500" /> Iniciar Sesión
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-600 text-xl">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          
          {/* Campo Usuario */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Usuario (Admin/Cocina)</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-green-500 focus:border-green-500"
              placeholder="Nombre de usuario"
              required
            />
          </div>

          {/* Campo Contraseña */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-green-500 focus:border-green-500"
              placeholder="********"
              required
            />
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Botón de Submit */}
          <button
            type="submit"
            disabled={cargando}
            className={`w-full py-3 font-bold rounded-lg transition-colors ${
              cargando 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-orange-500 text-white hover:bg-orange-600'
            }`}
          >
            {cargando ? 'Verificando...' : 'Acceder al Panel'}
          </button>
        </form>

      </div>
    </div>
  );
};

export default LoginModal;