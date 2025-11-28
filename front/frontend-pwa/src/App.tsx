import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from './components/Footer';


import Welcome from "./pages/Welcome";
import Contactos from './pages/Contactos';

import MenuDigital from "./pages/MenuDigital";
import DetalleProducto from "./pages/DetalleProducto";
import Personalizador from "./pages/Personalizador";

import Login from "./pages/Login";
import Registro from "./pages/Registro";

import Perfil from "./pages/Perfil";

import AdminLayout from "./layouts/AdminLayout";

import AdminDashboard from "./pages/AdminDashboard";
import PanelAdmin from "./pages/PanelAdmin";
import GestionCatalogo from "./pages/GestionCatalogo";
import GestionRecetas from "./pages/GestionRecetas";
import GestionUnidades from "./pages/GestionUnidades";
import GestionIngredientes from "./pages/GestionIngrediente";
import GestionPaquetes from "./pages/GestionPaquetes";
import GestionUsuarios from "./pages/GestionUsuarios";
import ModuloCocina from "./pages/ModuloCocina";

import ReportesAdmin from './pages/ReportesAdmin';

import Carrito from './pages/Carrito';

//Checkout
import Checkout from "./pages/Checkout";

import EstadoPedido from "./pages/EstadoPedido";

import PedidoExito from "./pages/PedidoExito";

import { CarritoProvider } from "./context/CarritoContext";

import { AuthProvider } from "./context/AuthContext";
import { WebSocketProvider } from "./context/WebSocketContext";

function App() {

  return (

    <AuthProvider>
      <WebSocketProvider>
        <Router>
          <CarritoProvider>
            <div className="App">
              <Navbar />
              <Routes>

                {/* Rutas Publicas */}

                <Route path="/" element={<Welcome />} />

                <Route path="/registro" element={<Registro />} />
                <Route path="/login" element={<Login />} />

                <Route path="/mi-perfil" element={<Perfil />} />

                <Route path="/contacto" element={<Contactos />} />
                <Route path="/menu" element={<MenuDigital />} />
                <Route path="/producto/:productoId" element={<DetalleProducto />} />
                {/* Personalizacion de chapata */}
                <Route path="/personalizar/nueva" element={<Personalizador />} />
                <Route path="/carrito" element={<Carrito />} />

                <Route path="/checkout" element={<Checkout />} />
                <Route path="/pedido/estado/:numeroPedidoUnico" element={<EstadoPedido />} />

                <Route path="/pedido/exito" element={<PedidoExito />} />



                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />

                  <Route path="dashboard" element={<AdminDashboard />} /> {/* Si queremos una ruta explícita */}
                  <Route path="pedidos" element={<PanelAdmin />} />
                  <Route path="cocina" element={<ModuloCocina />} />
                  <Route path="catalogo" element={<GestionCatalogo />} />
                  <Route path="ingredientes" element={<GestionIngredientes />} />
                  <Route path="unidades" element={<GestionUnidades />} />
                  <Route path="recetas" element={<GestionRecetas />} />
                  <Route path="/admin/paquetes" element={<GestionPaquetes />} />

                  <Route path="/admin/usuarios" element={<GestionUsuarios />} />
                  <Route path="reportes" element={<ReportesAdmin />} />
                </Route>








                <Route path="*" element={<h1 className="text-center p-10 text-xl">404 - Página no encontrada</h1>} />
              </Routes>

              <Footer />
            </div>
          </CarritoProvider>

        </Router>
      </WebSocketProvider>
    </AuthProvider>

  );


}

export default App;