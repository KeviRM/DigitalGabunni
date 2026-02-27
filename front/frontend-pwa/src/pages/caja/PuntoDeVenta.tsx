import React, { useState, useEffect, useMemo } from 'react';
import { FaSearch, FaPencilAlt, FaTrash, FaArrowLeft, FaBoxOpen, FaUtensils } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
// Asegúrate de que las rutas a tu API y Auth sean correctas
import { pedidosApi } from '../../api/axiosConfig'; 
import useAuth from '../../hooks/useAuth';

import { fetchCategorias, fetchProductos, fetchPaquetes } from '../../api/menuApi';


// --- IMPORTAR LOS MODALES DEL KIOSCO ---
import ModalDetalleProducto from '../Kiosco/ModalDetalleProducto'; 
import ModalDetallePaquete from '../Kiosco/ModalDetallePaquete';

import ModalCobro from '../../components/ModalCobro';

import ModalPersonalizadorPOS from './ModalPersonalizadorPOS';

const ID_CATEGORIA_PAQUETES = -999;
const ID_CATEGORIA_CHAPATAS = 1;



const PuntoDeVenta: React.FC = () => {


    const navigate = useNavigate();
    const { getAuthHeaders } = useAuth();

    const location = useLocation();
    const pedidoAEditar = location.state?.PedidoEditar || null;

    // --- ESTADOS DEL CATÁLOGO ---
    const [productos, setProductos] = useState<any[]>([]); 
    const [categorias, setCategorias] = useState<string[]>([]);
    const [paquetes, setPaquetes] = useState<any[]>([]);


    const [filtroActivo, setFiltroActivo] = useState<number | null>(null);

    const [busqueda, setBusqueda] = useState('');
    const [cargando, setCargando] = useState(true);

    // --- ESTADOS DEL CARRITO ---
    const [carrito, setCarrito] = useState<any[]>([]);
    const totalCarrito = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

    const [modalAbierto, setModalAbierto] = useState(false);
    const [ordenACobrar, setOrdenACobrar] = useState<any>(null);
    const [tipoEntrega, setTipoEntrega] = useState<'COMER_AQUI' | 'LLEVAR'>('LLEVAR');

    
    const [mostrarModalPersonalizador, setMostrarModalPersonalizador] = useState(false);

    // --- ESTADOS DE MODIFICACION ---
    const [itemEditando, setItemEditando] = useState<any>(null); // Guardará el item del carrito que estamos editando
    const [mostrarModalProducto, setMostrarModalProducto] = useState(false);
    const [mostrarModalPaquete, setMostrarModalPaquete] = useState(false);


    // :CARGAR PRODUCTOS DESDE EL BACKEND ---
   useEffect(() => {
           const cargarDatos = async () => {
               try {
                   const [prods, cats, paqs] = await Promise.all([fetchProductos(), fetchCategorias(), fetchPaquetes()]);
                   setProductos(prods);
                   setPaquetes(paqs);
   
                   if (paqs.length > 0) {
                       const catPaquetes: any = { id: ID_CATEGORIA_PAQUETES, name: 'Paquetes' };
                       setCategorias([catPaquetes, ...cats]);
                       setFiltroActivo(ID_CATEGORIA_PAQUETES);
                   } else {
                       setCategorias(cats);
                       if (cats.length > 0) setFiltroActivo(cats[0].id);
                   }
               } catch (error) {
                   console.error("Error cargando menú", error);
               } finally {
                   setCargando(false);
               }
           };
           cargarDatos();
       }, []);



    // --- EFECTO: PRECARGAR CARRITO EN MODO EDICIÓN ---
    useEffect(() => {
        // Aseguramos que ya haya cargado el menú (ya sean productos o paquetes)
        if (pedidoAEditar && (productos.length > 0 || paquetes.length > 0) && carrito.length === 0) {
            
            const carritoPrecargado = pedidoAEditar.details.map((detalle: any) => {
                let prodOriginal = productos.find(p => p.name === detalle.product_name) || 
                                   paquetes.find(p => p.name === detalle.product_name);
                
                // Si por alguna razón no lo encuentra, armamos un "mock" seguro
                if (!prodOriginal) {
                    prodOriginal = { id: detalle.product_id, name: detalle.product_name, price: detalle.unit_price };
                }

                return {
                    idUnico: `edit-${Date.now()}-${Math.random()}`,
                    producto: prodOriginal,
                    cantidad: detalle.quantity,
                    precio: parseFloat(detalle.unit_price),
                    personalizacion: detalle.personalizacion_json
                };
            });

            setCarrito(carritoPrecargado);
        }
    }, [pedidoAEditar, productos, paquetes]); 


        // -- FILTROS ---

       const productosFiltrados = useMemo(() => {
               if (filtroActivo === ID_CATEGORIA_PAQUETES) return [];
               if (filtroActivo === null) return productos;
               return productos.filter(p => p.category === filtroActivo);
           }, [productos, filtroActivo]);
       
           const paquetesFiltrados = useMemo(() => {
               if (filtroActivo === null || filtroActivo === ID_CATEGORIA_PAQUETES) {
                   return paquetes;
               }
               return [];
           }, [paquetes, filtroActivo]);



   
    // --- ACCIONES DEL CARRITO ---
    const agregarAlCarritoRapido = (producto: any) => {
        // En la caja agregamos rápido con 1 clic. Si quieren extras, usarán el botón Editar.
        const nuevoItem = {
            idUnico: `${producto.id}-${Date.now()}`,
            producto,
            cantidad: 1,
            precio: parseFloat(producto.price),
            personalizacion: null
        };
        setCarrito([...carrito, nuevoItem]);
    };

    const eliminarDelCarrito = (idUnico: string) => {
        setCarrito(carrito.filter(item => item.idUnico !== idUnico));
    };

   // --- ENVIAR PEDIDO A LA BD (COBRAR) ---
    const handleCobrar = async () => {
        if (carrito.length === 0) return alert("El carrito está vacío");

        try {
            const itemsParaBackend = carrito.map(item => {
                const prod = item.producto;
                let personalizacion = item.personalizacion || {};

                if (!item.personalizacion && (prod.items || prod.products || prod.category === -999)) {
                    personalizacion = { "Contenido": prod.items || prod.products || [] };
                }

                return {
                    product_name: prod.name, 
                    quantity: item.cantidad,
                    unit_price: item.precio, 
                    personalizacion_json: personalizacion
                };
            });


            // --- ENVIAR PEDIDO A LA BD (COBRAR O EDITAR) ---
   

            // 2. Construir el Payload con todos los campos obligatorios
            const payload = {
                client_name: "Cliente en Caja", // (Opcional: crear un estado para que el cajero escriba el nombre)
                phone_number: "0000000000",
                email: "caja@gabunni.com",
                amount: totalCarrito, 
                type_delivery: "LLEVAR", // (Opcional: crear un estado 'tipoEntrega' para alternar con 'COMER_AQUI')
                origen: "CAJA", // Importante para que tu backend sepa de dónde viene
                items_carrito: itemsParaBackend 
            };

          
            if (pedidoAEditar) {
                
                await pedidosApi.put(`/api/v1/pedidos/caja/${pedidoAEditar.order_number}/editar/`, payload, { 
                    headers: getAuthHeaders() 
                });
                alert("¡Orden actualizada con éxito!");
                navigate(-1); // Regresamos a la Terminal de Caja
            } else {
                
                const res = await pedidosApi.post('/api/v1/pedidos/crear/', payload, { headers: getAuthHeaders() });
                setOrdenACobrar(res.data);
                setModalAbierto(true);
            }

        } catch (error: any) {
            console.error("Error al crear la orden desde POS:", error);
            const msg = error.response?.data ? JSON.stringify(error.response.data) : "Error desconocido";
            alert(`Error al crear el pedido: ${msg}`);
        }
    };


    /* Controles de cantidad de carrito */

    const handleIncrementarCantidad = (idUnico: string) => {
        setCarrito(prev => prev.map(item =>
            item.idUnico === idUnico 
            ? { ...item, cantidad: item.cantidad + 1 } 
            : item
        ));


    };

    const handleDecrementarCantidad = (idUnico: string) => {
        setCarrito(prev => prev.map(item =>
            item.idUnico === idUnico && item.cantidad > 1
            ? { ...item, cantidad: item.cantidad - 1 } 
            : item
        ));
    };

    
    

    const agregarChapataPersonalizada = (producto: any, cantidad: number, personalizacion: any) => {
        const nuevoItem = {
            idUnico: `custom-${Date.now()}`,
            producto,
            cantidad,
            precio: parseFloat(producto.price), // El modal ya nos manda el total aquí
            personalizacion
        };
        setCarrito([...carrito, nuevoItem]);
        setMostrarModalPersonalizador(false);
    };






    // --- FUNCIÓN: ABRIR EL LÁPIZ ---
    const abrirEdicion = (item: any) => {
        setItemEditando(item);
        // Determinamos si es un paquete o un producto normal
        // Asumimos que si no tiene "category" pero sí "products" (o como lo devuelva tu API), es paquete
        if (item.producto.products || item.producto.category === undefined) {
             setMostrarModalPaquete(true);
        } else {
             setMostrarModalProducto(true);
        }
    };

    // --- FUNCIÓN: RECIBIR CAMBIOS DEL MODAL ---
    const guardarEdicion = (productoOriginal: any, nuevaCantidad: number, nuevaPersonalizacion: any) => {
        
        // Calculamos el nuevo precio base + los extras
        let precioAdicional = 0;
        if (nuevaPersonalizacion?.modificaciones?.extras) {
            precioAdicional = nuevaPersonalizacion.modificaciones.extras.reduce(
                (sum: number, extra: any) => sum + parseFloat(extra.additional_price || extra.price || 0), 
                0
            );
        }
        const nuevoPrecioUnitario = parseFloat(productoOriginal.price) + precioAdicional;

        // Actualizamos el carrito buscando el ID único que estábamos editando
        setCarrito(carritoActual => 
            carritoActual.map(item => {
                if (item.idUnico === itemEditando.idUnico) {
                    return {
                        ...item,
                        cantidad: nuevaCantidad,
                        precio: nuevoPrecioUnitario,
                        personalizacion: nuevaPersonalizacion
                    };
                }
                return item;
            })
        );

        // Cerramos los modales
        setMostrarModalProducto(false);
        setMostrarModalPaquete(false);
        setItemEditando(null);
    };




         // --- HELPER DE PERSONALIZACIÓN PRO (CAJA / POS) ---
    const renderPersonalizacionPro = (personalizacion: any) => {
        if (!personalizacion || typeof personalizacion !== 'object' || Object.keys(personalizacion).length === 0) return null;

        // 1. Paquetes (Contenido)
        if (personalizacion.Contenido || personalizacion.contenido) {
            const items = personalizacion.Contenido || personalizacion.contenido;
            return (
                <div className="mt-2 ml-2">
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Contenido del Paquete:</p>
                    <div className="flex flex-col space-y-1 border-l-2 border-blue-200 pl-3">
                        {items.map((item: any, i: number) => (
                            <span key={i} className="text-xs text-gray-600 font-medium">
                                {item.quantity || 1}x {item.product_name || item.name}
                            </span>
                        ))}
                    </div>
                </div>
            );
        }

        // 2. Modificaciones (Sin / Extras)
        if (personalizacion.modificaciones) {
            const { extras, sin } = personalizacion.modificaciones;
            return (
                <div className="flex flex-col mt-2 ml-2 space-y-1">
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Modificaciones:</p>
                    {sin && sin.map((ing: any, i: number) => (
                        <span key={`sin-${i}`} className="text-xs text-red-400 line-through font-medium">
                            - Sin {ing.name}
                        </span>
                    ))}
                    {extras && extras.map((ing: any, i: number) => (
                        <span key={`extra-${i}`} className="text-xs text-green-600 font-bold">
                            + {ing.name}
                        </span>
                    ))}
                </div>
            );
        }

        // 3. Chapata Personalizada (Cualquier otra llave que contenga ingredientes)
        const categorias = Object.keys(personalizacion).filter(k => k !== 'modificaciones' && k !== 'Contenido' && k !== 'contenido');
        if (categorias.length > 0) {
            const todos = categorias.flatMap(k => personalizacion[k]);
            if (todos.length > 0) {
                return (
                    <div className="mt-2 ml-2">
                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Ingredientes:</p>
                        <div className="flex flex-wrap gap-1.5">
                            {todos.map((ing: any, i: number) => (
                                <span key={i} className="text-[11px] font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-md border border-gray-200">
                                    {ing.name}
                                </span>
                            ))}
                        </div>
                    </div>
                );
            }
        }

        return null;
    };





    




        if (cargando) return <div className="flex h-screen items-center justify-center text-3xl font-bold text-gray-400 animate-pulse">Cargando Menú... </div>;


    return (
        <div className="flex h-screen bg-gray-50 p-4 gap-6">
            
            {/* === COLUMNA  CARRITO / TICKET === */}
            <div className="w-1/4 bg-white rounded-3xl shadow-lg flex flex-col border-t-4 border-x-4 border-orange-500 overflow-hidden relative">
                
                
                <button 
                    onClick={() => navigate('/caja/terminal')}
                    className="absolute top-4 left-4 text-gray-400 hover:text-orange-500 transition-colors"
                >
                    <FaArrowLeft size={20} />
                </button>

                <div className="p-4 border-b border-gray-100 mt-4">
                    <h2 className="text-2xl font-bold text-orange-500 text-center"> {pedidoAEditar ? 'Editar Pedido' : 'Nueva Orden'}</h2>
                </div>

                {/* Lista de Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {carrito.length === 0 ? (
                        <p className="text-center text-gray-400 mt-10">Agrega productos tocando el menú derecho</p>
                    ) : (
                       carrito.map(item => {
                            // Detectamos si es un paquete para bloquear su edición
                            const esPaquete = 
                                item.producto.category === ID_CATEGORIA_PAQUETES || 
                                item.producto.items !== undefined ||
                                item.personalizacion?.Contenido !== undefined ||
                                item.personalizacion?.contenido !== undefined;

                            return (
                                <div key={item.idUnico} className="border border-orange-200 bg-orange-50/30 rounded-xl p-4 flex flex-col gap-2 relative group transition-all hover:shadow-md">
                                    <div className="flex justify-between items-start font-bold text-gray-800 text-lg">
                                        
                                        {/* NUEVO CONTROL DE CANTIDAD Y NOMBRE */}
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                                                <button 
                                                    onClick={() => handleDecrementarCantidad(item.idUnico)}
                                                    className="px-3 py-1 text-gray-500 hover:bg-gray-100 hover:text-orange-500 transition-colors font-black"
                                                >-</button>
                                                <span className="px-2 font-bold text-orange-600 text-base min-w-6 text-center">
                                                    {item.cantidad}
                                                </span>
                                                <button 
                                                    onClick={() => handleIncrementarCantidad(item.idUnico)}
                                                    className="px-3 py-1 text-gray-500 hover:bg-gray-100 hover:text-orange-500 transition-colors font-black"
                                                >+</button>
                                            </div>
                                            <span className="leading-tight pr-2">{item.producto.name}</span>
                                        </div>

                                        {/* PRECIO TOTAL DEL ITEM */}
                                        <span className="text-green-600 shrink-0">${(item.precio * item.cantidad).toFixed(2)}</span>
                                    </div>

                                    {/* PERSONALIZACIÓN (El Súper Helper) */}
                                    {item.personalizacion && renderPersonalizacionPro(item.personalizacion)}
                                    
                                    {/* BOTONES DE ACCIÓN FLOTANTES */}
                                    <div className="flex justify-end gap-3 mt-2">
                                        {/* SOLO MOSTRAMOS EL LÁPIZ SI NO ES UN PAQUETE */}
                                        {!esPaquete && (
                                            <button 
                                                onClick={() => abrirEdicion(item)} 
                                                className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition shadow-sm"
                                                title="Personalizar (Extras/Sin)"
                                            >
                                                <FaPencilAlt size={14} />
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => eliminarDelCarrito(item.idUnico)} 
                                            className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition shadow-sm"
                                            title="Eliminar del ticket"
                                        >
                                            <FaTrash size={14} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer de Cobro */}
                <div className="bg-white border-t-3 border-dashed border-orange-500 p-6 mb-14 z-10">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-gray-500 font-bold uppercase tracking-wider text-sm">Total a Pagar</span>
                        <span className="text-4xl font-extrabold text-orange-500">${totalCarrito.toFixed(2)}</span>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => setCarrito([])} className="flex-1 py-3 text-red-500 border-2 border-red-500 font-bold rounded-xl hover:bg-red-100 transition">
                            Limpiar
                        </button>
                        <button onClick={handleCobrar} className="flex-2 w-2/3 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition shadow-lg text-lg">
                             {pedidoAEditar ? 'Guardar Cambios' : 'Cobrar Orden'}
                        </button>
                    </div>
                </div>
            </div>

            {/* === COLUMNA DERECHA: CATÁLOGO DE PRODUCTOS === */}




            <div className="w-3/4 flex flex-col gap-6">
                
                {/* Cabecera: Categorías y Buscador */}
                <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm">
                    {/* Botones de Categorías */}

                    

                    <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2 flex-1">
                        { 
                            categorias.map(cat => (
                                <button 
                                    key={cat.id}
                                    onClick={() => setFiltroActivo(cat.id)}
                                    className={`px-6 py-2 rounded-xl font-bold transition-all border-2 whitespace-nowrap
                                        ${filtroActivo === cat.id ? 'border-orange-500 text-orange-500 bg-orange-50' : 'border-transparent text-gray-500 hover:bg-gray-100'}`}
                                >
                                    <span>{cat.name}</span>
                                    {cat.id === ID_CATEGORIA_PAQUETES && <FaBoxOpen className="opacity-50" />}
                                </button>
                            ))
                        }
                    </div>
                    
                    {/* Buscador Rápido */}
                    <div className="relative ml-4 shrink-0">
                        <input 
                            type="text" 
                            placeholder="Buscar producto..." 
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none w-64 transition"
                        />
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">


            


                {/* Grid de Categorias */}
                    
               
                    { 
                        <div className="grid grid-cols-3 xl:grid-cols-4 gap-4 pr-2">
                            {paquetesFiltrados.map(paq => (
                                <button 
                                    key={paq.id} 
                                    onClick={() => agregarAlCarritoRapido(paq)}
                                    className="bg-white border-2 border-orange-300 rounded-2xl p-4 flex flex-col items-center justify-center hover:border-orange-500 hover:shadow-md transition-all active:scale-95 group h-36 relative"
                                >
                                    {/* Opcional: Si tienes imagen, descomenta esto */}
                                    {/* <img src={paq.image} alt={paq.name} className="w-16 h-16 object-contain mb-2" /> */}
                                    
                                    <span className="font-bold text-gray-700 text-center leading-tight group-hover:text-orange-500 line-clamp-2">{paq.name}</span>
                                    <span className="text-green-600 font-extrabold mt-2 text-xl">${parseFloat(paq.price).toFixed(2)}</span>
                                </button>
                            ))}
                        </div>
                    }
                    

                    

                    



                {/* Grid de Productos */}
                    { 
                        <div className="grid grid-cols-3 xl:grid-cols-4 gap-4 pr-2">


                            {filtroActivo === ID_CATEGORIA_CHAPATAS && (
                                <div
                                    onClick={() => setMostrarModalPersonalizador(true)}
                                    className="bg-orange-50 rounded-3xl shadow-lg border-2 border-dashed border-orange-300 p-6 flex flex-col justify-center items-center text-center cursor-pointer hover:bg-orange-100 transition-all duration-300 h-36 group"
                                >
                                   
                                    <h3 className="text-2xl font-bold text-orange-600 mb-2 leading-tight">Armar  Chapata Personalizada</h3>
                                    
                                    <span className="bg-orange-500 text-white py-3 px-8 rounded-full font-bold shadow-md group-hover:shadow-lg transform transition-all">
                                        Comenzar
                                    </span>
                                </div>
                            )}

                            {productosFiltrados.map(prod => (
                                <button 
                                    key={prod.id} 
                                    onClick={() => agregarAlCarritoRapido(prod)}
                                    className="bg-white border-2 border-orange-300 rounded-2xl p-4 flex flex-col items-center justify-center hover:border-orange-500 hover:shadow-md transition-all active:scale-95 group h-36 relative"
                                >
                                    {/* Opcional: Si tienes imagen, descomenta esto */}
                                    {/* <img src={prod.image} alt={prod.name} className="w-16 h-16 object-contain mb-2" /> */}
                                    
                                    <span className="font-bold text-gray-700 text-center leading-tight group-hover:text-orange-500 line-clamp-2">{prod.name}</span>
                                    <span className="text-green-600 font-extrabold mt-2 text-xl">${parseFloat(prod.price).toFixed(2)}</span>
                                </button>
                            ))}
                        </div>
                    }
                </div>

            </div>



                {/* === RENDERIZADO DE MODALES PRESTADOS DEL KIOSCO === */}
            
            {mostrarModalProducto && itemEditando && (
                <ModalDetalleProducto
                    producto={itemEditando.producto}
                    onClose={() => setMostrarModalProducto(false)}
                    // Usamos nuestra función adaptada en lugar de onAddToCart
                    onAddToCart={guardarEdicion} 
                    // Opcional: Si quieres que el modal se abra con la cantidad/extras pre-cargados
                    // tendrías que pasarle el 'itemEditando.personalizacion', pero por ahora 
                    // simplemente se abrirá limpio para que lo rehagan.
                />
            )}

            {mostrarModalPaquete && itemEditando && (
                <ModalDetallePaquete
                    paquete={itemEditando.producto}
                    onClose={() => setMostrarModalPaquete(false)}
                    onAddToCart={guardarEdicion}
                />
            )}


            {mostrarModalPersonalizador && (
                <ModalPersonalizadorPOS
                    onClose={() => setMostrarModalPersonalizador(false)}
                    onAddToCart={agregarChapataPersonalizada}
                />
            )}




            {/* MODAL COBRO */}
            {modalAbierto && ordenACobrar && (
                <ModalCobro
                    isOpen={modalAbierto}
                    onClose={() => setModalAbierto(false)}
                    orderNumber={ordenACobrar.order_number}
                    daily_sequence={ordenACobrar.daily_sequence?.toString().padStart(2, '0') }
                    total={ordenACobrar.amount}
                    onPaymentSuccess={() => {
                        // Se limpia el POS para el siguiente cliente
                        setCarrito([]);
                        setModalAbierto(false);
                        setOrdenACobrar(null);
                        alert(`¡Orden #${ordenACobrar.daily_sequence} cobrada con éxito!`);
                    }}
                />
            )}


        </div>
    );
};

export default PuntoDeVenta;