import React, {useState, useEffect, useMemo} from "react";
import type { Producto, Categoria, Paquete, ItemCarrito } from "../types/menu";
import { fetchCategorias, fetchProductos, fetchPaquetes } from "../api/menuApi";
import FiltrosMenu from "../components/FiltroMenu";
import { useCarrito } from "../context/CarritoContext";
import { useNavigate } from "react-router-dom";

import TarjetaPaquete from "../components/TarjetaPaquete";


interface TarjetaProductoProps {
    producto: Producto;
    onNavigateToDetail: (productoId: number) => void; 
}
// Componente para mostrar un producto del menu


const ID_CATEGORIA_PAQUETES = -999;

const TarjetaProducto : React.FC<TarjetaProductoProps> = ({ producto, onNavigateToDetail }) => {

    return (
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden transform hover:scale-[1.02] transition duration-300"
            onClick={() => onNavigateToDetail(producto.id)}
        >


            <div className="relative h-48">
                <img 
                src={producto.image || 'https://1.bp.blogspot.com/-JUmaXrEYbPs/XnPhc3k7V0I/AAAAAAAAN0A/reZohppseB4uFlD3L6JS5Xv6yngGprCZgCLcBGAsYHQ/s1600/chapata.jpg'}
                alt={producto.name}
                className="w-full h-full object-cover"
                />

                <span className="absolute top-3 right-3 bg-green-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-md">
                    ${producto.price}
                </span>
            </div>



            <div className="p-4">

                <h3 className="text-xl font-bold text-gray-800">{producto.name}</h3>
                <p className="txt-sm text-gray-500 mt-1">{producto.description.substring(0,70)}....</p>
                <p className="xs text-orange-800 mt-2">Categoria: {producto.category_name}</p>

                {/* boton carrito */}

                
                <button className="mt-4 w-52 bg-orange-400 text-white py-2 rounded-full font-semibold
                                hover:bg-orange-600 transition-colors duration-200"

                        onClick={(e) => { e.stopPropagation(); onNavigateToDetail(producto.id); }}
                >
                    Pedir
                </button>
            </div>


        </div>
    );
};






const MenuDigital : React.FC = () => {

    const [productos, setProductos] = useState<Producto[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [filtroActivo, setFiltroActivo] = useState<number | null>(null);
    const [cargando, setCargando] = useState(true);
    const [paquetes, setPaquetes] = useState<Paquete[]>([]);


    const navigate = useNavigate(); // Inicializar useNavigate
    const { agregarItem } = useCarrito();


    // Carga de datos del back


    useEffect(() => {
        const cargarDatos = async () => {
            const [prods, cats, paqs] = await Promise.all([fetchProductos(), fetchCategorias(), fetchPaquetes()]);
            setProductos(prods);
            setPaquetes(paqs);
            setCargando(false);



            if (paqs.length > 0){
                const catPaquetes: Categoria = {id: ID_CATEGORIA_PAQUETES, name: 'Paquetes'};
                setCategorias([catPaquetes, ...cats]);

            } else {
                setCategorias(cats);
            }

            setCargando(false);

        };
        cargarDatos();

    }, []);








    const handleAddPaqueteToCart = (paquete: Paquete) => {
      
      const productoAdaptado: Producto = {
          id: -paquete.id, // ID negativo para evitar colisión con productos reales
          name: ` ${paquete.name}`,
          description: paquete.description,
          price: paquete.price,
          image: paquete.image,
          category: ID_CATEGORIA_PAQUETES,
          category_name: "Paquetes",
          is_active: true,
          receta: [] 
      };

      const item: Omit<ItemCarrito, 'idUnico' | 'cantidad'> = {
          productoBase: productoAdaptado,
          precioUnitario: parseFloat(paquete.price),
          // Podríamos guardar los items del paquete en la personalización si quisiéramos mostrarlos

          contenidoPaquete: paquete.items.map(i => ({
              product_name: i.product_name,
              quantity: i.quantity
          }))


      };

      agregarItem(item);
      alert(`Paquete "${paquete.name}" añadido al carrito.`);
  };

















  

    const handleNavigateToDetail = (productoId: number) => {
        navigate(`/producto/${productoId}`);
    };

    // filtrado en tiempo real

    const productosFiltrados = useMemo(() =>{
        if (filtroActivo === ID_CATEGORIA_PAQUETES) return [];
        if (filtroActivo === null){
            return productos;
        }

        return productos.filter(p => p.category == filtroActivo);
    }, [productos, filtroActivo]
    ); 


    const paquetesFiltrados = useMemo(() => {
      // Mostrar paquetes si el filtro es "Todos" (null) o "Paquetes"
      if (filtroActivo === null || filtroActivo === ID_CATEGORIA_PAQUETES) {
          return paquetes;
      }
      return [];
  }, [paquetes, filtroActivo]);


    if (cargando) {
        return <div className="text-center p-8 text-xl font-medium">Cargando Menú....</div>;
    }

    return (

        <div className="min-h-screen bg-gray-50 p-6">
            <h1 className="text-6xl font-extrabold text-gray-950 text-center mb-8 border-b-5 border-gray-200 pb-3 mx-auto max-w">
                Menú
            </h1>
        


            <FiltrosMenu
            categorias={categorias}
            filtroActivo={filtroActivo}
            onSelectFiltro={setFiltroActivo}
            />

            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mx-auto max-w-6xl">


            {/* --- Tarjeta Estática de Personalización  --- */}
             
                
              
                
                {/* filtroActivo === null || */}

                {( filtroActivo === 1) && ( 
                    <div 
                        className="bg-green-100 rounded-xl shadow-lg border-2 border-orange-500 p-6 transform hover:scale-[1.02] transition duration-300 cursor-pointer flex flex-col justify-center items-center text-center"
                        onClick={() => navigate('/personalizar/nueva')}
                    >
                        <h3 className="text-2xl font-bold text-green-700 mb-2"> Arma tu Propia Chapata</h3>
                        <p className="text-gray-700">Elige tus ingredientes desde cero.</p>
                        <button className="mt-4 bg-orange-500 text-white py-2 px-4 rounded-lg font-semibold">Comenzar</button>
                    </div>
                )}

                {paquetesFiltrados.map(paquete => (
                    <TarjetaPaquete 
                        key={paquete.id} 
                        paquete={paquete} 
                        onAddToCart={handleAddPaqueteToCart}
                    />
                ))}



                {productosFiltrados.length > 0 ? (
                    productosFiltrados.map(producto => (
                        <TarjetaProducto 
                            key={producto.id} 
                            producto={producto} 
                            onNavigateToDetail={handleNavigateToDetail}
                        />
                    ))
                ) : (
                   
                    <p className="text-center text-gray-500 col-span-full">
                         No hay productos disponibles en esta categoría.
                    </p>
                )}

            </div>

        </div>


    );



};


export default MenuDigital;