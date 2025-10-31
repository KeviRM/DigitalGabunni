import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MenuDigital from "./pages/MenuDigital";
import DetalleProducto from "./pages/DetalleProducto";


//carrito

import Carrito from './pages/Carrito';
import { CarritoProvider } from "./context/CarritoContext";

//Checkout
import Checkout from "./pages/Checkout";


function App() {

  return(
  <Router>
    <CarritoProvider>
      <div className="App">
        <Routes>
            {/* Ruta para el menú principal */}
            <Route path="/" element={<MenuDigital/>} />
            
            <Route path="/producto/:productoId" element={<DetalleProducto />} />
            

            <Route path="/carrito" element={<Carrito/>}/>

            <Route path="/checkout" element={<Checkout/>}/>

            {/* TODO: Más tarde agregaremos rutas para /carrito, /contacto, /about, etc. */}
            <Route path="*" element={<h1 className="text-center p-10 text-xl">404 - Página no encontrada</h1>} />
          </Routes>

      </div> 
    </CarritoProvider>
    
  </Router>
  );
  
  
}

export default App