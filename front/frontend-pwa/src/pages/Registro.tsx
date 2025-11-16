// frontend-pwa/src/pages/Registro.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaGoogle, FaUserPlus } from 'react-icons/fa';
import axios from 'axios';
import gabunniImage from "../assets/gabunniLogo.jpg"


const REGISTRO_API_URL = 'http://127.0.0.1:8002/api/registro/'; 

const Registro: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '', 
        email: '',
        phone_number: '', 
        password: '',
        password2: '',
        aceptaTerminos: false, 
    });
    const [cargando, setCargando] = useState(false);
    const [errores, setErrores] = useState<any>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
        setErrores({ ...errores, [name]: '' }); 
    };
    
    // Simulación del registro con Google 
    const handleGoogleRegistro = () => {
        alert("Iniciando flujo de registro con Google (OAuth pendiente de implementación)");
        // Aquí iría el inicio del flujo de OAuth con Google.
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrores({});
        
        if (!formData.aceptaTerminos) {
            setErrores({ general: "Debes aceptar el Aviso de Privacidad y Términos y Condiciones." });
            return;
        }

        if (formData.password !== formData.password2) {
            setErrores({ password2: "Las contraseñas no coinciden." });
            return;
        }

        setCargando(true);

        const dataToSend = {
            username: formData.username,
            first_name: formData.username,
            email: formData.email,
            password: formData.password,
            password2: formData.password2,
            phone_number: formData.phone_number,
        };

        try {
            await axios.post(REGISTRO_API_URL, dataToSend);
            alert("¡Registro exitoso! Ya puedes iniciar sesión.");
            navigate('/login');
        } catch (error: any) {
            console.error("Error de Registro:", error.response?.data);
            if (error.response && error.response.data) {
                setErrores(error.response.data);
            } else {
                setErrores({ general: "Error de red. Inténtalo de nuevo." });
            }
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-2xl border-t-8 border-orange-500">
                
                <div className="flex justify-between items-center mb-6">
                    <img src={gabunniImage} alt="Gabunni Logo" className="h-10 w-auto" />
                    <button 
                        onClick={() => navigate(-1)} 
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
                    >
                        Volver
                    </button>
                </div>
                
                <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">
                    Crea tu cuenta!
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* Mensaje de Error General */}
                    {errores.general && <p className="text-red-500 text-sm">{errores.general}</p>}

                    {/* Fila: Nombre/Usuario y Correo */}
                    <div className="flex gap-4">
                        <div className='w-1/2'>
                            <input
                                type="text"
                                name="username"
                                placeholder="Nombre de Usuario (Obligatorio)"
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full p-3 border rounded-lg"
                                required
                            />
                            {errores.username && <p className="text-red-500 text-xs mt-1">{errores.username}</p>}
                        </div>
                        <div className='w-1/2'>
                            <input
                                type="email"
                                name="email"
                                placeholder="Correo electrónico (Obligatorio)"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full p-3 border rounded-lg"
                                required
                            />
                            {errores.email && <p className="text-red-500 text-xs mt-1">{errores.email}</p>}
                        </div>
                    </div>

                    {/* Fila: Número Telefónico (Opcional) */}
                    <input
                        type="tel"
                        name="numero_telefono"
                        placeholder="Número telefónico (Opcional)"
                        value={formData.phone_number}
                        onChange={handleChange}
                        className="w-full p-3 border rounded-lg"
                    />
                    {errores.numero_telefono && <p className="text-red-500 text-xs mt-1">{errores.numero_telefono}</p>}

                    {/* Fila: Contraseñas */}
                    <div className="flex gap-4">
                        <div className='w-1/2'>
                            <input
                                type="password"
                                name="password"
                                placeholder="Contraseña"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full p-3 border rounded-lg"
                                required
                            />
                            {errores.password && <p className="text-red-500 text-xs mt-1">{errores.password}</p>}
                        </div>
                        <div className='w-1/2'>
                            <input
                                type="password"
                                name="password2"
                                placeholder="Confirmar Contraseña"
                                value={formData.password2}
                                onChange={handleChange}
                                className="w-full p-3 border rounded-lg"
                                required
                            />
                            {errores.password2 && <p className="text-red-500 text-xs mt-1">{errores.password2}</p>}
                        </div>
                    </div>
                    
                    {/* Aviso de Privacidad y Términos  */}
                    <div className="flex items-center space-x-2 pt-2">
                        <input
                            type="checkbox"
                            name="aceptaTerminos"
                            checked={formData.aceptaTerminos}
                            onChange={handleChange}
                            className="text-orange-500 focus:ring-orange-500"
                            required
                        />
                        <label className="text-sm text-gray-700">
                            He leído y acepto el <a href="#" className="text-orange-600 hover:underline">Aviso de Privacidad</a> y <a href="#" className="text-orange-600 hover:underline">Términos y Condiciones</a>.
                        </label>
                    </div>

                    {/* Botón de Registro */}
                    <button
                        type="submit"
                        disabled={cargando}
                        className={`w-full py-3 font-bold rounded-lg transition-colors ${
                            cargando 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-orange-500 text-white hover:bg-orange-600'
                        }`}
                    >
                        <FaUserPlus className='inline mr-2' /> {cargando ? 'Registrando...' : 'Registrarme'}
                    </button>
                    
                    {/* Opciones de Terceros */}
                    <div className="text-center text-sm text-gray-500 pt-2">
                        <hr className="my-2 border-gray-300" />
                        <span className="bg-white px-2 relative -top-4">Continuar con</span>
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleRegistro}
                        className="w-full py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 flex items-center justify-center"
                    >
                        <FaGoogle className="mr-2" /> Google
                    </button>
                </form>

            </div>
        </div>
    );
};

export default Registro;