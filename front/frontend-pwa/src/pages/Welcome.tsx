// frontend-pwa/src/pages/Welcome.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaPhone, FaClock, FaBreadSlice, FaGlassWhiskey, FaBlender } from 'react-icons/fa';
import ImageIndex from "../assets/images_index/Chapata(1).webp";
import Imagecat1 from "../assets/images_index/chapata.webp";
import Imagecat2 from "../assets/images_index/bebidas_1.webp";
import Imagecat3 from "../assets/images_index/saludable.webp";


const Welcome: React.FC = () => {
    const navigate = useNavigate();

    return (
        <main>
            <div className="relative h-[60vh] " >
                <div className={`absolute inset-0 bg-[${ImageIndex}] opacity-80 overflow-hidden`}> <img src={ImageIndex} className='w-full  blur-[5px]' alt="" /></div>
                <div className="relative max-w-7xl text-center   mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center text-white">
                    <h1 className="text-5xl font-extrabold mb-4 ">
                        Saborea la Frescura en Cada Bocado 
                    </h1>
                    <p className="text-xl mb-8">
                        Bienvenido a  Gabunni, donde cada chapata es una obra maestra de sabor. 
                    </p>
                    <button 
                        onClick={() => navigate('/menu')} 
                        className="w-fit px-8 py-3  bg-orange-500 text-white font-semibold rounded-lg text-lg hover:bg-orange-600 transition-colors shadow-lg"
                    >
                        Explorar Menú
                    </button>
                </div>
            </div>

            <div className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-extrabold text-gray-800 mb-2">
                        Explora Nuestro Menú 
                    </h2>
                    <p className="text-lg text-gray-600 mb-10">
                        Elaborado con los ingredientes más frescos, solo para ti. 
                    </p>
                    <div className="flex  justify-center  gap-6">
                        {/* Tarjetas de Categoría  */}
                        {/* Chapata */}
                        <div className="w-full md:w-1/3   overflow-hidden  bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                            <img src={Imagecat1} className='h-3/5 w-full' alt="" />
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Chapatas</h3>
                            <p className="text-sm hidden md:block text-gray-600 mb-2">Nuestras chapatas son la combinación perfecta de pan crujiente y rellenos frescos. </p>
                        </div>
                        {/* Bebidas */}
                        <div className="w-full md:w-1/3 overflow-hidden bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                            <img src={Imagecat2} className='h-3/5 w-full' alt="" />

                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Bebidas</h3>
                            <p className="text-sm hidden md:block text-gray-600">Amplia selección de bebidas frías y calientes. Incluye cafés premium, tés herbales y refrescos. </p>
                        </div>
                        {/* Jugos */}
                        <div className="w-full md:w-1/3 overflow-hidden bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                            <img src={Imagecat3} className='h-3/5 w-full' alt="" />
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Saludable</h3>
                            <p className="text-sm hidden md:block text-gray-600">Nuestros jugos y batidos naturales, recién hechos. Combina frutas de temporada. </p>
                        </div>
                        
                    </div>
                    <Link to="/menu" className="inline-block mt-10 px-10 py-3 bg-orange-500 text-white font-semibold rounded-lg text-lg hover:bg-orange-600 transition-colors shadow-lg">
                        Menú
                    </Link>
                </div>
            </div>

            {/* --- Sección 3: Visítanos y Mapa (image_1.png) --- */}
            <div className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl font-extrabold text-gray-800 text-center mb-10">
                        Visítanos 
                    </h2>
                    <div className="flex flex-wrap md:flex-nowrap gap-8">
                        
                        {/* Información de Contacto */}
                        <div className="w-full md:w-1/3 space-y-6">
                            <p className="text-lg text-gray-600">Estamos ansiosos por atenderte.</p>

                            <div className="flex items-start">
                                <FaMapMarkerAlt className="text-orange-500 text-xl mr-3 mt-1" />
                                <div>
                                    <p className="font-semibold">Dirección</p>
                                    <p className="text-gray-700">Plaza de la Constitución S/N, Cuauhtémoc, 06010 Ciudad de México, CDMX </p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <FaPhone className="text-orange-500 text-xl mr-3 mt-1" />
                                <div>
                                    <p className="font-semibold">Teléfono</p>
                                    <p className="text-gray-700">(555) 123-4567 </p>
                                </div>
                            </div>
                            
                            <div className="flex items-start">
                                <FaClock className="text-orange-500 text-xl mr-3 mt-1" />
                                <div>
                                    <p className="font-semibold">Horario</p>
                                    <p className="text-gray-700">Lun - Sáb: 9:00 AM - 10:00 PM </p>
                                </div>
                            </div>
                        </div>

                        {/* Mapa de Google  */}
                        <div className="w-full md:w-2/3 h-96 rounded-xl overflow-hidden shadow-xl">
                             {/* Usamos un iframe placeholder para replicar el mapa  */}
                            <iframe 
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1000!2d-99.1352!3d19.4326!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85d1f855d497c6c7%3A0x6b4b45b0a3c2a9e!2sPalacio%20Nacional!5e0!3m2!1sen!2smx!4v1678886980000" 
                                width="100%" 
                                height="100%" 
                                style={{border:0}} 
                                allowFullScreen={false} 
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            />
                        </div>

                    </div>
                </div>
            </div>
        </main>
    );
};

export default Welcome;