// frontend-pwa/src/components/Footer.tsx
import React from 'react';
import { FaFacebookF, FaTwitter, FaInstagram } from 'react-icons/fa';
import { useShopInfo } from '../context/ShopInfoContext';
import { Link } from 'react-router-dom';
import GabunniLogo from '../assets/gabunniLogo.jpg'

const Footer: React.FC = () => {
    const { info } = useShopInfo();

    return (
        <footer className="bg-white border-t border-gray-200 py-8 mt-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

                <div className="flex justify-center mb-3">
                    <img src={GabunniLogo} alt="Gabunni Logo" className="h-10 w-auto" />
                </div>
                <p className="text-gray-600 mb-4">
                    {info.mensaje_footer || "Chapatas frescas, jugos y bebidas con los mejores ingredientes."}
                </p>


                <div className="flex justify-center space-x-6 mb-6">
                    {info.facebook_url && <a href={info.facebook_url} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-600 text-xl"><FaFacebookF /></a>}
                    {info.tiktok_url && <a href={info.tiktok_url} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-black text-xl"><FaInstagram /></a>} {/* Using Instagram icon for Tiktok temporarily or need FaTiktok */}
                    {info.instagram_url && <a href={info.instagram_url} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-pink-600 text-xl"><FaInstagram /></a>}
                </div>

                <p className="text-xs text-gray-400">
                    © 2025 Gabunni. Todos los derechos reservados.
                </p>
            </div>
        </footer>
    );
};

export default Footer;