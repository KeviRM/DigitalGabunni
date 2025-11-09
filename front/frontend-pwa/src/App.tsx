import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MenuDigital from "./pages/MenuDigital";
import DetalleProducto from "./pages/DetalleProducto";
import PanelAdmin from "./pages/PanelAdmin";
import GestionCatalogo from "./pages/GestionCatalogo";
import Navbar from "./components/Navbar";
import GestionRecetas from "./pages/GestionRecetas";

//carrito

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
            {/* Ruta para el menú principal */}
            <Route path="/" element={<MenuDigital/>} />
            
            <Route path="/producto/:productoId" element={<DetalleProducto />} />
            

            <Route path="/carrito" element={<Carrito/>}/>

            <Route path="/checkout" element={<Checkout/>}/>
            <Route path="/pedido/estado/:numeroPedidoUnico" element={<EstadoPedido/>} />


            <Route path="/admin/recetas" element={<GestionRecetas />} />
            <Route path="/admin/catalogo" element={<GestionCatalogo />} />
            <Route path="/admin/pedidos" element={<PanelAdmin />} /> {/* Nueva ruta de administración */}
            {/* TODO: Más tarde agregaremos rutas para /carrito, /contacto, /about, etc. */}
            <Route path="*" element={<h1 className="text-center p-10 text-xl">404 - Página no encontrada</h1>} />
          </Routes>

      </div> 
    </CarritoProvider>
    
  </Router>
  );
  
  
}

export default App