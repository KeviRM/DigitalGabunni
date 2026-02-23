import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from './components/Footer';

import Layout from "./layouts/Layout";


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
import GestionIngredientes from "./pages/GestionIngredientes";
import GestionPaquetes from "./pages/GestionPaquetes";

import GestionCategoria from "./pages/GestionCategoria";



import GestionUsuarios from "./pages/GestionUsuarios";


import CocinaLayout from "./layouts/CocinaLayout";
import ModuloCocina from "./pages/ModuloCocina";

import ReportesAdmin from './pages/ReportesAdmin';

import Carrito from './pages/Carrito';


//Checkout
import Checkout from "./pages/Checkout";

import EstadoPedido from "./pages/EstadoPedido";

import PedidoExito from "./pages/PedidoExito";
import PedidoFallo from './pages/PedidoFallo';
import PedidoPendiente from './pages/PedidoPendiente';

import EditContent from "./pages/Admin/EditContent";
import MensajesAdmin from "./pages/Admin/MensajesAdmin";

import { CarritoProvider } from "./context/CarritoContext";

import { AuthProvider } from "./context/AuthContext";

//CAJA
import GestionCaja from "./pages/caja/GestionCaja";
import CajaLayout from "./layouts/CajaLayout";
import TerminalCaja from "./pages/caja/TerminalCaja";
import PuntoDeVenta from "./pages/caja/PuntoDeVenta";

//KIOSCO
import KioscoLayout from "./layouts/KioscoLayout";
import MenuKiosco from "./pages/Kiosco/MenuKiosco";
import BienvenidaKiosco from "./pages/Kiosco/Bienvenida";

function App() {

  return (

    <AuthProvider>

      <Router>
        {/* <CarritoProvider> */}
          <div className="App">

        

            {/* <Navbar /> */}
            <Routes>

              {/* Rutas Publicas */}

              <Route path="/" element={<Layout />} >

                <Route index element={<Navigate to="/inicio" replace />} />


                <Route path="/inicio" element={<Welcome />} />

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
                <Route path="/pedido/fallo" element={<PedidoFallo />} />
                <Route path="/pedido/pendiente" element={<PedidoPendiente />} />


              </Route>
      


              {/* RUTAS CAJA */}
                

              <Route path="/caja" element={<CajaLayout />}>
                <Route index element={<Navigate to="/caja/terminal" replace />} />
                <Route path="terminal" element={<TerminalCaja />} />
                <Route path="gestion" element={<GestionCaja />} />
                <Route path="nueva-orden" element={<PuntoDeVenta />} />
                

                
              </Route>

                {/* RUTAS COCINA */}
              <Route path="/cocina" element={<CocinaLayout />}>
                <Route index element={<Navigate to="/cocina/comanda-pedidos" replace />} />
                <Route path="comanda-pedidos" element={<ModuloCocina />} />
                

                
                
              </Route>


              
                {/* RUTAS Kiosco */}
              <Route path="/kiosco" element={<KioscoLayout />}>
                <Route index element={<Navigate to="/kiosco/bienvenida" replace />} />
                <Route path="menu" element={<MenuKiosco />} />
                <Route path="bienvenida" element={<BienvenidaKiosco />} />
                

                
                
              </Route>

              




              {/* Rutas Admin */}



              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />

                <Route path="dashboard" element={<AdminDashboard />} /> {/* Si queremos una ruta explícita */}
                <Route path="pedidos" element={<PanelAdmin />} />
                <Route path="catalogo" element={<GestionCatalogo />} />
                                
                <Route path="categorias" element={<GestionCategoria />} />
                
                <Route path="ingredientes" element={<GestionIngredientes />} />
                <Route path="unidades" element={<GestionUnidades />} />
                <Route path="recetas" element={<GestionRecetas />} />
                <Route path="/admin/paquetes" element={<GestionPaquetes />} />

                <Route path="/admin/usuarios" element={<GestionUsuarios />} />
                <Route path="reportes" element={<ReportesAdmin />} />
                <Route path="contenido" element={<EditContent />} />
                <Route path="mensajes" element={<MensajesAdmin />} />
              </Route>








              <Route path="*" element={<h1 className="text-center p-10 text-xl">404 - Página no encontrada</h1>} />
            </Routes>

            {/* <Footer /> */}
          </div>
        {/* </CarritoProvider> */}

      </Router>
    </AuthProvider>

  );


}

export default App;