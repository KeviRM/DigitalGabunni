// frontend-pwa/src/pages/Contactos.tsx
import React, { useState } from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import { useShopInfo } from '../context/ShopInfoContext';

// Endpoint para enviar el formulario de contacto (Microservicio de Contenido, si estuviera separado)
// Usamos el Microservicio de Catálogo por simplicidad inicial si no creamos un servicio de contenido
// const CONTACT_API_URL = 'http://127.0.0.1:8000/api/v1/contacto/enviar/'; 

const Contactos: React.FC = () => {
    const { info } = useShopInfo();
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        mensaje: '',
        email: '' // Añadimos email aunque no esté en el diseño explícito, es necesario para responder
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Formulario enviado! (Lógica de API pendiente)');
        // Aquí iría la lógica de axios.post(CONTACT_API_URL, formData)
        // Criterio de aceptación: Mandar a administración. 
        setFormData({ nombre: '', apellido: '', mensaje: '', email: '' });
    };

    return (
        <main className="min-h-screen">
            {/* Título y Hero Section (image_2.png) */}
            <div className="relative h-64 bg-cover bg-center flex items-center justify-center" style={{ backgroundImage: "url('../assets/gabunniLogo.jpg')" }}>
                <div className="absolute inset-0 bg-black opacity-60"></div>
                <h1 className="relative text-5xl font-extrabold text-white z-10">
                    Contacto
                </h1>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-wrap md:flex-nowrap gap-10">

                    {/* Información de Contacto [cite: 9] */}
                    <div className="w-full md:w-1/3">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-l-4 border-orange-500 pl-3">
                            Información de Gabunni
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Si prefieres no usar el formulario, puedes encontrarnos a través de los siguientes canales:
                        </p>

                        <div className="space-y-6">
                            {/* Teléfono [cite: 9] */}
                            <div className="bg-white p-4 rounded-lg shadow-md flex items-center">
                                <FaPhone className="text-orange-500 text-2xl mr-4" />
                                <div>
                                    <p className="font-semibold">Llámanos</p>
                                    <p className="text-gray-700">{info.telefono_principal}</p>
                                    {info.telefono_secundario && <p className="text-gray-700">{info.telefono_secundario}</p>}
                                </div>
                            </div>
                            {/* Email / Redes Sociales (implícito en criterios de aceptación) [cite: 9] */}
                            <div className="bg-white p-4 rounded-lg shadow-md flex items-center">
                                <FaEnvelope className="text-orange-500 text-2xl mr-4" />
                                <div>
                                    <p className="font-semibold">Escríbenos</p>
                                    <p className="text-gray-700">{info.email}</p>
                                </div>
                            </div>
                            {/* Ubicación [cite: 9] */}
                            <div className="bg-white p-4 rounded-lg shadow-md flex items-center">
                                <FaMapMarkerAlt className="text-orange-500 text-2xl mr-4" />
                                <div>
                                    <p className="font-semibold">Visítanos</p>
                                    <p className="text-gray-700">{info.direccion}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Formulario de Mensaje  */}
                    <div className="w-full md:w-2/3 bg-white p-6 rounded-xl shadow-lg border">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">
                            Enviar un Mensaje
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="flex gap-4">
                                <input
                                    type="text"
                                    name="nombre"
                                    placeholder="Tu nombre"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    className="w-1/2 p-3 border rounded-lg focus:ring-orange-500"
                                    required
                                />
                                <input
                                    type="text"
                                    name="apellido"
                                    placeholder="Tu apellido"
                                    value={formData.apellido}
                                    onChange={handleChange}
                                    className="w-1/2 p-3 border rounded-lg focus:ring-orange-500"
                                />
                            </div>
                            {/* Añadido campo Email para responder */}
                            <input
                                type="email"
                                name="email"
                                placeholder="Tu correo electrónico"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full p-3 border rounded-lg focus:ring-orange-500"
                                required
                            />
                            <textarea
                                name="mensaje"
                                placeholder="Escribe tu pregunta o mensaje"
                                value={formData.mensaje}
                                onChange={handleChange}
                                rows={5}
                                className="w-full p-3 border rounded-lg focus:ring-orange-500"
                                required
                            />

                            <button
                                type="submit"
                                className="w-full py-3 bg-orange-500 text-white font-bold rounded-lg text-lg hover:bg-orange-600 transition-colors"
                            >
                                Enviar Mensaje
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Contactos;