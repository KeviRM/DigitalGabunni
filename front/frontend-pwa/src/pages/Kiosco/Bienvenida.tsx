import React from 'react';
import { useNavigate } from 'react-router-dom';
import gabunniLogo from '../../assets/gabunniLogo.jpg';

const Bienvenida: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div
            /* Todo el div es un botón gigante */
            onClick={() => navigate('/kiosco/menu')}
            className="h-full flex flex-col items-center pt-20 cursor-pointer animate-fade-in"
        >

            <div className="absolute top-0 w-full h-2 bg-linear-to-r from-orange-400 to-orange-600"></div>


            <div className="mb-32 transform hover:scale-105 transition-transform duration-500">
                <img 
                    src={gabunniLogo} 
                    alt="Gabunni Kiosco" 
                    className="w-64 md:w-80 object-contain drop-shadow-xl " 
                />
            </div>

            <div className="text-center space-y-4">
                <h1 className="text-4 md:text-5xl text-gray-600 font-light tracking-wide animate-pulse">
                    Toca aquí para ordenar
                </h1>
                
                <div className="mt-8 text-orange-400 opacity-50 animate-bounce ">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                </div>
            </div>

            <div className="absolute bottom-0 w-full h-2 bg-linear-to-r from-orange-400 to-orange-600"></div>
        </div>
    );
};

export default Bienvenida;