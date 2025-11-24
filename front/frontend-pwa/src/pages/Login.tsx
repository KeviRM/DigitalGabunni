// frontend-pwa/src/pages/Login.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaLock, FaTimes, FaGoogle } from 'react-icons/fa';
import useAuth from '../hooks/useAuth';
import gabunniImage from "../assets/gabunniLogo.jpg";



//Hook de google

import { useGoogleLogin } from '@react-oauth/google';



const Login: React.FC = () => {
    const navigate = useNavigate();
    const { login, loginWithGoogle } = useAuth();
    
    // NOTA: El diseño sugiere "Correo electrónico", pero JWT usa "username" o "email" para el POST. 
    // Usaremos 'username' en el estado, pero la etiqueta será 'Correo o Usuario'.
    const [username, setUsername] = useState(''); 
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLoginSuccess = (role: 'admin' | 'cocinero' | 'cliente' | null) => {
        if (role === 'admin') {
            navigate('/admin');
        } else if (role === 'cocinero') {
            navigate('/admin/cocina');
        } else if (role === 'cliente') {
            navigate('/'); 
        } else {
            
            navigate('/');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setCargando(true);

        try {
            const result = await login(username, password); 

            if (result.success) {
                handleLoginSuccess(result.role); 
            } else {
                setError('Credenciales inválidas. Por favor, verifica tu correo/usuario y contraseña.');
            }
        } catch (err: any) {
            // Capturar errores específicos del backend (ej: cuenta inactiva)
            const backendError = err.message || "Error de red o servidor.";
            setError(backendError);
        } finally {
            setCargando(false);
        }
    };

    

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setCargando(true);
            // Enviamos el access_token de Google a nuestro backend
            const result = await loginWithGoogle(tokenResponse.access_token);
            
            if (result.success) {
                handleLoginSuccess(result.role);
            } else {
                setError('Error al iniciar sesión con Google.');
            }
            setCargando(false);
        },
        onError: () => {
            setError('Falló la conexión con Google.');
        }
    });

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-2xl border-t-8 border-orange-500">
                
                <div className="flex justify-between items-center mb-6">
                    <img src={gabunniImage} alt="Gabunni Logo" className="h-10 w-auto" />
                    <button onClick={() => navigate(-1)} className="px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600">
                        Volver
                    </button>
                </div>
                
                <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">
                    Iniciar sesión
                </h2>

                <form onSubmit={handleSubmit}>
                    
                    {/* Campo Correo o Usuario (Usamos username en el estado) */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico o user</label>
                        <input
                            type="text"
                            value={username}
                            autoComplete="username"
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-3 border rounded-lg focus:ring-orange-500 focus:border-orange-500"
                            placeholder="Tu correo o usuario"
                            required
                        />
                    </div>

                    {/* Campo Contraseña */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                        <input
                            type="password" 
                            value={password}
                            autoComplete="current-password"
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 border rounded-lg focus:ring-orange-500 focus:border-orange-500"
                            placeholder="********"
                            required
                        />
                    </div>
                    
                    <div className="flex justify-between items-center mb-6">
                        <label className="flex items-center text-sm text-gray-700">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="mr-2 text-orange-500 rounded focus:ring-orange-500"
                            />
                            Recordarme
                        </label>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Botón de Acceder */}
                    <button
                        type="submit"
                        disabled={cargando}
                        className={`w-full py-3 font-bold rounded-lg transition-colors ${
                            cargando 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-orange-500 text-white hover:bg-orange-600'
                        }`}
                    >
                        {cargando ? 'Verificando...' : 'Acceder'}
                    </button>
                    
                    {/* Opciones de Terceros */}
                    <div className="text-center text-sm text-gray-500 pt-4">
                        <hr className="my-3 border-gray-300" />
                        <span className="bg-white px-2 relative -top-6">Acceder con</span>
                    </div>
                    

                    {/* Boton de Google */}
                    <button
                        type="button"
                        onClick={() => googleLogin()} 
                        className="w-full py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 flex items-center justify-center"
                    >
                        <FaGoogle className="mr-2 text-red-500" /> Google
                    </button>
                    
                    <p className="text-center text-sm mt-4">
                        ¿No tienes cuenta? 
                        <span onClick={() => navigate('/registro')} className="text-orange-600 hover:text-orange-700 cursor-pointer font-semibold ml-1">
                            Regístrarme
                        </span>
                    </p>

                </form>

            </div>
        </div>
    );
};

export default Login;