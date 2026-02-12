import Navbar from "../components/Navbar";
import Footer from '../components/Footer';
import { CarritoProvider } from "../context/CarritoContext";

import { Outlet } from "react-router-dom";



const Layout: React.FC = () => {
    return (
        <CarritoProvider>
        <div className="flex flex-col min-h-screen">

            <Navbar />

            <main className="flex-1">
                <Outlet />
            </main>
        

            <Footer />
        </div>
        </CarritoProvider>
    );
};

export default Layout;