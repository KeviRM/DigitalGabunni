import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from './components/Footer';


import Welcome from "./pages/Welcome";
import Contactos from './pages/Contactos';

import MenuDigital from "./pages/MenuDigital";
import DetalleProducto from "./pages/DetalleProducto";
import Personalizador from "./pages/Personalizador";


import PanelAdmin from "./pages/PanelAdmin";
import AdminDashboard from "./pages/AdminDashboard";
import GestionCatalogo from "./pages/GestionCatalogo";
import GestionRecetas from "./pages/GestionRecetas";
import GestionUnidades from "./pages/GestionUnidades";
import GestionIngredientes from "./pages/GestionIngrediente";

import ModuloCocina from "./pages/ModuloCocina";


import Carrito from './pages/Carrito';
import { CarritoProvider } from "./context/CarritoContext";

//Checkout
import Checkout from "./pages/Checkout";

import EstadoPedido from "./pages/EstadoPedido";


function App() {

  return(
  <Router>
    <CarritoProvider>
      <div className="App">
        <Navbar/>
        <Routes>
             <Route path="/" element={<Welcome/>} />

            <Route path="/contacto" element={<Contactos />} />
            {/* Ruta para el menú principal */}
            <Route path="/menu" element={<MenuDigital/>} />
            
            {/* Producto establecido */}
            <Route path="/producto/:productoId" element={<DetalleProducto />} />
            
            {/* Personalizacion de chapata */}


            <Route path="/personalizar/nueva" element={<Personalizador />} />


            <Route path="/carrito" element={<Carrito/>}/>

            <Route path="/checkout" element={<Checkout/>}/>
            <Route path="/pedido/estado/:numeroPedidoUnico" element={<EstadoPedido/>} />

            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/recetas" element={<GestionRecetas />} />
            <Route path="/admin/catalogo" element={<GestionCatalogo />} />
            <Route path="/admin/pedidos" element={<PanelAdmin />} /> 
            <Route path="/admin/unidades" element={<GestionUnidades />} />

            <Route path="/admin/cocina" element= {<ModuloCocina/>}/>

            <Route path="/admin/ingredientes" element={<GestionIngredientes />} />


            <Route path="*" element={<h1 className="text-center p-10 text-xl">404 - Página no encontrada</h1>} />
          </Routes>

          <Footer />
      </div> 
    </CarritoProvider>
    
  </Router>
  );
  
  
}

export default App