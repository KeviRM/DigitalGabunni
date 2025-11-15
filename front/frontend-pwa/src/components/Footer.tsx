// frontend-pwa/src/components/Footer.tsx
import React from 'react';
import { FaFacebookF, FaTwitter, FaInstagram } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import GabunniLogo from '../assets/gabunniLogo.jpg'

const Footer: React.FC = () => {
    return (
        <footer className="bg-white border-t border-gray-200 py-8 mt-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                
                <div className="flex justify-center mb-3">
                    <img src={GabunniLogo} alt="Gabunni Logo" className="h-10 w-auto" />
                </div>
                <p className="text-gray-600 mb-4">
                    Chapatas frescas, jugos y bebidas con los mejores ingredientes. 
                </p>

               
                <div className="flex justify-center space-x-6 mb-6">
                    <a href="#" className="text-gray-500 hover:text-blue-600 text-xl"><FaFacebookF /></a>
                    <a href="#" className="text-gray-500 hover:text-blue-400 text-xl"><FaTwitter /></a>
                    <a href="#" className="text-gray-500 hover:text-pink-600 text-xl"><FaInstagram /></a>
                </div>

                <p className="text-xs text-gray-400">
                    © 2025 Gabunni. Todos los derechos reservados.
                </p>
            </div>
        </footer>
    );
};

export default Footer;