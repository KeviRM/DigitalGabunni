import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCarrito } from "../context/CarritoContext";
import { FaShoppingCart,  FaUserCircle,  FaTimes, FaBars } from "react-icons/fa";
import useAuth from "../hooks/useAuth";
import gabunniImage from "../assets/gabunniLogo.jpg"




const Navbar : React.FC = () => {


    const { items } = useCarrito();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const {isAuthenticated, logout, getUserRole} = useAuth();

    const role = getUserRole();

    


    const navItems = [
    {name: 'INICIO', path: '/'},
    { name: 'MENÚ', path: '/menu' },
    { name: 'CONTACTOS', path: '/contacto' },   
    ];


    


    const handlePerfil = () => {
      
      if (isAuthenticated && role === 'admin' || role ==='cocinero' ){
        navigate('/admin'); 
      } else{
        navigate('/mi-perfil');
      }
    }
  
  

return (
    <header className="bg-white shadow-md  border-b-3 border-gray-100  sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          


          {/* Menu Movil */}

          <button 
            className="md:hidden text-gray-700 hover:text-orange-600 focus:outline-none text-2xl"
            onClick={() => setIsOpen(true)}
          >
            <FaBars/>
          </button>





          {/* Logo */}
          <Link to="/" className="shrink-0">
            <img src={gabunniImage} alt="Gabunni Logo" className="h-20 w-auto shadow-2xl  rounded-b-4xl" /> 
          </Link>

          {/* Enlaces de Navegación Central */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map(item => (
              <Link
                key={item.name}
                to={item.path}
                className="text-gray-700 hover:text-orange-600 font-bold tracking-wider transition-colors duration-200 flex items-center"
              >
                
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Íconos y Botones de Usuario/Administrador */}
          <div className="flex items-center space-x-4">
            
           


            {/* Carrito de Compras */}
            <Link to="/carrito" className="relative text-gray-700 hover:text-orange-600">
              <FaShoppingCart className="w-6 h-6" />
              {items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {items.length}
                </span>
              )}
            </Link>

            {/* Inicio de Sesión (Cliente/Admin) */}
            {isAuthenticated ? (
              
                <button 
                onClick={handlePerfil}
                    className="px-4 py-2 border hidden md:block border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  <div></div>
                   { role === 'admin' ? (  <div><FaUserCircle className="inline mr-1" />Panel Admin</div>):(<div><FaUserCircle className="inline mr-1" />Mi Perfil</div>) } 

                </button>
              
            ) : (
              <Link to="/login" className="hidden sm:block">
              <button 
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"

              >
                <FaUserCircle className="inline mr-1" /> Iniciar Sesión
              </button>
            </Link>
            )}


            {isAuthenticated && (
              <button 
                  onClick={logout}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hidden md:block text-sm font-medium hover:bg-red-600"
              >
                Cerrar Sesión
              </button>
            )}

            {!isAuthenticated && (
              <Link to="/registro" className="hidden sm:block">
                <button className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600">
                  Regístrate
                </button>
              </Link>
            
            )}
          </div>
        </div>
      </div>






    <div
        className={`fixed inset-0  bg-opacity-50 z-40 transition-opacity md:hidden ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={() => setIsOpen(false)} // Cierra al hacer clic fuera
      />

      {/* Sidebar Contenido */}
    <aside
        className={`fixed top-0 left-0 w-64 h-full bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-orange-600">Gabunni</h2>
          <button 
            className="text-gray-700 hover:text-red-500 focus:outline-none text-xl"
            onClick={() => setIsOpen(false)}
          >
            <FaTimes /> {/* Botón de cierre (X) */}
          </button>
        </div>
        
        {/* Enlaces del Sidebar */}
        <nav className="flex flex-col p-4 space-y-3">
          {navItems.map(item => (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setIsOpen(false)} // Cierra el menú al navegar
              className="text-gray-700 hover:text-orange-600 font-semibold text-lg py-2 border-b border-gray-100 flex items-center"
            >
              
              {item.name}
            </Link>
          ))}
          
          {/* Login/Registro en Sidebar (Si fueron ocultados en la vista móvil) */}
          <div className='pt-4  flex flex-col space-y-5'>
            {/* Inicio de Sesión (Cliente/Admin) */}
            {isAuthenticated ? (
              
                <button 
                onClick={handlePerfil}
                    className="px-4 py-2 border md:block border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                 
                   { role === 'admin' ? (  <div><FaUserCircle className="inline mr-1" />Panel Admin</div>):(<div><FaUserCircle className="inline mr-1" />Mi Perfil</div>) } 

                </button>
              
            ) : (
              <Link to="/login" className=" sm:block">
              <button 
                className="px-4 py-2 border md:block border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"

              >
                <FaUserCircle className="inline mr-1" /> Iniciar Sesión
              </button>
            </Link>
            )}

             {isAuthenticated && (
              <button 
                  onClick={logout}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg  text-sm font-medium hover:bg-red-600"
              >
                Cerrar Sesión
              </button>
            )}
              
            {!isAuthenticated && (
                <Link to="/registro" onClick={() => setIsOpen(false)}>
                    <button className="w-full py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600">
                      Registrate
                    </button>
                </Link>
            )}


            




          </div>
        </nav>
    </aside>




      





    </header>
  );
};

export default Navbar;