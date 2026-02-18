import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// --- IMPORTS DE API ---
import { fetchCategorias, fetchProductos, fetchPaquetes } from '../../api/menuApi';
import { pedidosApi } from '../../api/axiosConfig';
import useAuth from '../../hooks/useAuth';

// --- IMPORT DEL CONTEXTO KIOSCO (EL MOTOR REAL) ---
import { useKiosco } from '../../context/KioscoContext';
import ModalPersonalizadorKiosco from './ModalPersonalizadorKiosco';
import ModalDetalleProducto from './ModalDetalleProducto';

// --- IMPORTS DE ICONOS Y ASSETS ---
import { FaShoppingCart, FaChevronLeft, FaTrash, FaUtensils, FaBoxOpen } from 'react-icons/fa';
import gabunniLogo from '../../assets/gabunniLogo.jpg';


import ModalDetallePaquete
 from './ModalDetallePaquete';

const ID_CATEGORIA_PAQUETES = -999;
const ID_CATEGORIA_CHAPATAS = 1;

const MenuKiosco: React.FC = () => {
    const navigate = useNavigate();
    const { getAuthHeaders } = useAuth();

    // --- CONEXIÓN AL CONTEXTO KIOSCO ---
    const {
        items,
        agregarAlCarrito: agregarItem,
        eliminarDelCarrito: eliminarItem,
        modificarCantidad,
        total,

        limpiarCarrito
    } = useKiosco();

    // --- ESTADOS LOCALES ---
    const [productos, setProductos] = useState<any[]>([]);
    const [categorias, setCategorias] = useState<any[]>([]);
    const [paquetes, setPaquetes] = useState<any[]>([]);

    const [filtroActivo, setFiltroActivo] = useState<number | null>(null);
    const [cargando, setCargando] = useState(true);

    const[paqueteSeleccionado, setPaqueteSeleccionado] = useState<any | null>(null);

    // --- ESTADOS DE FLUJO ---
    const [modalCheckout, setModalCheckout] = useState(false);
    const [tipoEntrega, setTipoEntrega] = useState<'COMER_AQUI' | 'LLEVAR'>('COMER_AQUI');
    const [enviandoOrden, setEnviandoOrden] = useState(false);
    const [showModalPersonalizar, setShowModalPersonalizar] = useState(false);
    const [productoSeleccionado, setProductoSeleccionado] = useState<any | null>(null);

    // --- NUEVOS ESTADOS PARA PANTALLA DE ÉXITO (#01) ---
    const [ordenExitosa, setOrdenExitosa] = useState<number | null>(null);
    const [segundosRestantes, setSegundosRestantes] = useState(45);

    // --- 1. CARGA DE DATOS ---
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

    // --- 2. CONTADOR REGRESIVO (PANTALLA ÉXITO) ---
    useEffect(() => {
        let intervalo: any;
        if (ordenExitosa !== null && segundosRestantes > 0) {
            intervalo = setInterval(() => {
                setSegundosRestantes((prev) => prev - 1);
            }, 1000);
        } else if (segundosRestantes === 0) {
            handleFinalizar(); // Se acabó el tiempo
        }
        return () => clearInterval(intervalo);
    }, [ordenExitosa, segundosRestantes]);

    const handleFinalizar = () => {
        setOrdenExitosa(null);
        setSegundosRestantes(45);
        navigate('/kiosco'); // Volver a bienvenida/inicio
    };


    
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
    
    // --- 4. MANEJADORES DE CARRITO ---


    const handleAddProductoDirecto = (producto: any, e: React.MouseEvent) => {
        e.stopPropagation();
        agregarItem(producto, false);
    };

    const handleAddPaqueteToCart = (paquete: any) => {
        agregarItem(paquete, true);
    };

    // -- AGREGAR AL CARRITO DESDE EL MODAL DE PAQUETE ---

    const handleAddPaqueteDesdeModal = (paq: any) => {
        agregarItem(paq, true);
        setPaqueteSeleccionado(null);
    };
    // Esta función recibe los datos del ModalDetalleProducto
    const handleAddProductoDesdeModal = (producto: any, cantidad: number, personalizacion?: any) => {
        
        //  Calcular el precio unitario real (Base + Extras)
        let precioFinal = parseFloat(producto.price);
        
        if (personalizacion?.modificaciones?.extras) {
            // Sumamos el precio de cada extra seleccionado
            const totalExtras = personalizacion.modificaciones.extras.reduce((sum: number, ext: any) => sum + parseFloat(ext.price), 0);
            precioFinal += totalExtras;
        }

        //. Crear un objeto producto "clonado" con la info nueva
        // Inyectamos la personalización DENTRO del producto para que viaje con él en el carrito
        const productoParaCarrito = {
            ...producto,
            price: precioFinal, 
            personalizacion_interna: personalizacion // Guardamos el JSON para enviarlo al backend luego
        };

        //  Agregar al carrito
        // (producto, esPaquete, cantidad)
        agregarItem(productoParaCarrito, false, cantidad);
        
        //  Cerrar el modal
        setProductoSeleccionado(null);
    };

    const handlePersonalizarDesdeModal = (_producto: any) => {
        setProductoSeleccionado(null);
        setShowModalPersonalizar(true);
    };

    // ENVIAR PEDIDO A LA BD  ---
    const handleConfirmarOrden = async () => {
        setEnviandoOrden(true);
        try {
            //  Mapeo correcto de items para el Serializer del Backend
            const itemsParaBackend = items.map(item => {
                let personalizacion = {};
                const prod = item.producto as any; 

                if (prod.personalizacion_interna) {
                    personalizacion = prod.personalizacion_interna;
                }
                else if (prod.personalizacion_chapata) {
                    personalizacion = prod.personalizacion_chapata;
                }

                // Si es paquete, intentamos mandar su contenido como info extra
                else if (item.esPaquete && prod.items) {
                    personalizacion = { "Contenido": prod.items };
                }

                
                return {
                    product_name: prod.name,
                    quantity: item.cantidad,
                    unit_price: item.precio, // El precio ya viene limpio del KioscoContext
                    personalizacion_json: personalizacion
                };
            });

            // Construcción del Payload con los campos requeridos
            const payload = {
                client_name: "Cliente Kiosco",
                phone_number: "0000000000",
                email: "kiosco@gabunni.com",
                amount: total, 
                type_delivery: tipoEntrega,
                origen: "KIOSCO", 
                items_carrito: itemsParaBackend 
            };

            console.log(" Enviando Payload:", payload);

            const res = await pedidosApi.post('/api/v1/pedidos/crear/', payload, { headers: getAuthHeaders() });

            // ÉXITO: Obtenemos el número corto (daily_sequence)
            const numeroTurno = res.data.daily_sequence;

            limpiarCarrito();
            setModalCheckout(false);

            // Activamos la pantalla de éxito
            setOrdenExitosa(numeroTurno);

        } catch (error: any) {
            console.error("Error creating order:", error);
            const msg = error.response?.data ? JSON.stringify(error.response.data) : "Error desconocido";
            alert(`Error al crear el pedido: ${msg}`);
        } finally {
            setEnviandoOrden(false);
        }
    };




    // --- HELPER PARA MOSTRAR DETALLES EN EL CARRITO ---
    const renderDetallesItem = (item: any) => {
        const prod = item.producto;

        //  Paquetes
        if (item.esPaquete) {
            return (
                <div className="mt-1">
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Productos:</p>
                    {/* Lista de productos del paquete */}
                    <div className="flex flex-col space-y-0.5 ml-1 border-l-2 border-blue-100 pl-1">
                        {prod.items?.map((pItem: any, idx: number) => (
                            <span key={idx} className="text-[10px] text-gray-500 leading-tight">
                                {pItem.quantity}x {pItem.product_name}
                            </span>
                        ))}
                    </div>
                </div>
            );
        }

        // Modificaciones(Nuevo sistema)
        if (prod.personalizacion_interna) {
            const { extras, sin } = prod.personalizacion_interna.modificaciones || {};
            return (
                <div className="flex flex-col mt-1 space-y-0.5">

                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Modificaciones:</p>

                    {sin?.map((ing: any, i: number) => (
                        <span key={`sin-${i}`} className="text-[10px] text-red-400 line-through leading-tight">Sin {ing.name}</span>
                    ))}
                    {extras?.map((ing: any, i: number) => (
                        <span key={`extra-${i}`} className="text-[10px] text-green-600 font-bold leading-tight">+ {ing.name}</span>
                    ))}
                </div>
            );
        }

        //  Chapata Personalizada 
        if (prod.personalizacion_chapata) {
            const todos = Object.values(prod.personalizacion_chapata).flat() as any[];
            
            if (todos.length > 0) {
                return (
                    <div className="mt-1">
                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Ingredientes:</p>
                        <div className="flex flex-wrap gap-1">
                            {todos.slice(0, 5).map((ing: any, i: number) => (
                                <span key={i} className="text-[10px] text-gray-500 bg-gray-100 px-1.5 rounded border border-gray-200">
                                    {ing.name}
                                </span>
                            ))}
                            {todos.length > 5 && <span className="text-[10px] text-gray-400">...</span>}
                        </div>
                    </div>
                );
            }
        }

        return null;
    };





    if (cargando) return <div className="flex h-screen items-center justify-center text-3xl font-bold text-gray-400 animate-pulse">Cargando Menú... </div>;

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans select-none">

            {/* ---  CATEGORÍAS --- */}
            <aside className="w-1/5 bg-white shadow-xl z-20 flex flex-col">
                <div className="p-6 border-b border-gray-100 flex justify-center bg-white">
                    <img src={gabunniLogo} alt="Logo" className="w-32 object-contain" />
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {categorias.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setFiltroActivo(cat.id)}
                            className={`w-full py-16 px-4 rounded-2xl text-xl font-bold transition-all transform duration-200 border-2 shadow-sm text-left flex items-center justify-between
                                ${filtroActivo === cat.id
                                    ? 'bg-orange-500 text-white border-orange-500 scale-105 shadow-orange-200'
                                    : 'bg-white text-gray-500 border-gray-200 hover:border-orange-300 hover:text-orange-400'
                                }`}
                        >
                            <span>{cat.name}</span>
                            {cat.id === ID_CATEGORIA_PAQUETES && <FaBoxOpen className="opacity-50" />}
                        </button>
                    ))}
                </div>

                <div className="p-4 bg-white">
                    <button
                        onClick={() => navigate('/kiosco')}
                        className="w-full py-4 rounded-xl border-2 border-red-300 text-red-500 font-bold flex items-center justify-center gap-2 hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                        <FaChevronLeft /> Cancelar Orden
                    </button>
                </div>
            </aside>

            {/* --- GRID DE PRODUCTOS --- */}
            <main className="w-3/5 p-6 overflow-y-auto bg-gray-50 relative custom-scrollbar">

                <h2 className="text-4xl font-extrabold text-gray-800 mb-8 capitalize sticky top-0 bg-gray-50/95 z-10 py-4 backdrop-blur-sm border-b border-gray-200">
                    {categorias.find(c => c.id === filtroActivo)?.name || 'Menú'}
                </h2>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 pb-20">

                    {/* Tarjeta Personalizar */}
                    {filtroActivo === ID_CATEGORIA_CHAPATAS && (
                        <div
                            onClick={() => setShowModalPersonalizar(true)}
                            className="bg-orange-50 rounded-3xl shadow-lg border-2 border-dashed border-orange-300 p-6 flex flex-col justify-center items-center text-center cursor-pointer hover:bg-orange-100 transition-all duration-300 h-[380px] group"
                        >
                            <div className="bg-orange-200 p-6 rounded-full mb-6 text-orange-600 group-hover:scale-110 transition-transform">
                                <FaUtensils size={40} />
                            </div>
                            <h3 className="text-2xl font-bold text-orange-600 mb-2 leading-tight">Arma tu Propia Chapata</h3>
                            <p className="text-gray-600 text-sm mb-6">Elige tus ingredientes desde cero.</p>
                            <span className="bg-orange-500 text-white py-3 px-8 rounded-full font-bold shadow-md group-hover:shadow-lg transform transition-all">
                                Comenzar
                            </span>
                        </div>
                    )}

                    {/* PAQUETES */}
                    {paquetesFiltrados.map(paq => (
                        <div 
                            key={paq.id} 
                            onClick={() => setPaqueteSeleccionado(paq)} // <--- AHORA ABRE MODAL
                            className="bg-white rounded-3xl shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-[380px] group border-3 border-orange-400 cursor-pointer"
                        >
                            <div className="h-48 bg-gray-100 relative overflow-hidden shrink-0">
                                <img
                                    src={paq.image || 'https://via.placeholder.com/300'}
                                    alt={paq.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-4 right-4 bg-orange-600 text-white px-4 py-1 rounded-full font-extrabold shadow-lg text-lg">
                                    ${parseFloat(paq.price).toFixed(0)}
                                </div>
                            </div>
                            
                            <div className="p-5 flex-1 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 leading-tight mb-2">{paq.name}</h3>
                                    
                                    {/* MUESTRA PREVIA DE ITEMS (Máximo 3) */}
                                    <div className="text-xs text-gray-500 space-y-1">
                                        {paq.items.slice(0, 3).map((item: any, i: number) => (
                                            <div key={i} className="flex gap-1 items-center">
                                                <span className="font-bold text-gray-500">{item.quantity}x</span> 
                                                <span className="truncate">{item.product_name}</span>
                                            </div>
                                        ))}
                                        {paq.items.length > 3 && <span className="text-gray-400 italic">+ más...</span>}
                                    </div>
                                </div>
                                
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation(); // Para que no abra el modal si dan click directo al botón
                                        handleAddPaqueteToCart(paq);
                                    }}
                                    className="w-full mt-2 bg-orange-50 hover:bg-orange-600 text-orange-600 hover:text-white font-bold py-3 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    Agregar Paquete
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* PRODUCTOS REGULARES */}
                    {productosFiltrados.map(prod => (
                        <div key={prod.id}
                            onClick={() => setProductoSeleccionado(prod)}
                            className="bg-white rounded-3xl shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-[380px] group border border-orange-200 cursor-pointer">
                            <div className="h-48 bg-gray-100 relative overflow-hidden shrink-0">
                                <img
                                    src={prod.image || 'https://1.bp.blogspot.com/-JUmaXrEYbPs/XnPhc3k7V0I/AAAAAAAAN0A/reZohppseB4uFlD3L6JS5Xv6yngGprCZgCLcBGAsYHQ/s1600/chapata.jpg'}
                                    alt={prod.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-4 right-4 bg-white text-gray-800 px-4 py-1 rounded-full font-extrabold shadow-lg text-lg">
                                    ${prod.price}
                                </div>
                            </div>

                            <div className="p-5 flex-1 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 leading-tight mb-2">{prod.name}</h3>
                                    <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">{prod.description}</p>
                                </div>

                                <div className="flex gap-2 mt-2">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setProductoSeleccionado(prod); }}
                                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-3 rounded-xl transition-colors text-sm"
                                    >
                                        Detalles
                                    </button>
                                    <button
                                        onClick={(e) => handleAddProductoDirecto(prod, e)}
                                        className="flex-2 bg-orange-100 hover:bg-orange-500 text-orange-600 hover:text-white font-bold py-3 rounded-xl transition-all active:scale-95"
                                    >
                                        Agregar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Mensaje Vacío */}
                    {productosFiltrados.length === 0 && paquetesFiltrados.length === 0 && filtroActivo !== null && (
                        <div className="col-span-full py-20 text-center">
                            <p className="text-gray-400 text-xl">No hay productos disponibles en esta categoría.</p>
                        </div>
                    )}
                </div>
            </main>

            {/* ---  CARRITO --- */}
            <aside className="w-1/5 bg-white border-l border-gray-200 flex flex-col shadow-2xl z-30">
                <div className="p-6 bg-orange-500 text-white shadow-md">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <FaShoppingCart className="text-white" /> Tu Orden
                    </h3>
                    <p className="text-xs text-gray-200 mt-1">{items.length} productos agregados</p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-gray-50">
                    {items.length === 0 ? (
                        <div className="text-center mt-32 opacity-40">
                            <FaShoppingCart className="text-6xl mx-auto mb-4 text-gray-400" />
                            <p className="font-bold text-gray-500">Carrito vacío</p>
                            <p className="text-xs text-gray-400">Selecciona productos del menú</p>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.idUnico} className="bg-white p-4 rounded-xl shadow-sm border border-gray-300 animate-fade-in-up">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1 pr-2">
                                    <p className="font-bold text-sm text-gray-800 line-clamp-2 leading-tight flex-1 pr-2">
                                        {item.producto.name}
                                    </p>
                                    {renderDetallesItem(item)}

                                    </div>
                                    <button
                                        onClick={() => eliminarItem(item.idUnico)}
                                        className="text-gray-300 hover:text-red-500 p-1 hover:bg-red-50 rounded-lg transition-colors -mt-1 -mr-1"
                                    >
                                        <FaTrash size={14} />
                                    </button>
                                </div>

                                

                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-sm text-orange-600 font-extrabold">
                                            ${(item.precio * item.cantidad).toFixed(2)}
                                        </p>
                                        {item.esPaquete && (
                                            <span className="text-[10px] bg-blue-100 text-blue-700 px-1 rounded block mt-1 w-fit">Paquete</span>
                                        )}
                                    </div>
                                    <div className="flex items-center bg-gray-100 rounded-lg border border-gray-200">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); modificarCantidad(item.idUnico, item.cantidad - 1); }}
                                            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 hover:text-orange-600 rounded-l-lg font-bold transition-colors"
                                        >
                                            -
                                        </button>
                                        <span className="w-8 text-center text-sm font-bold text-gray-800 select-none">{item.cantidad}</span>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); modificarCantidad(item.idUnico, item.cantidad + 1); }}
                                            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 hover:text-orange-600 rounded-r-lg font-bold transition-colors"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-5 bg-white border-t-4 border-orange-500 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
                    <div className="flex justify-between items-end mb-4">
                        <span className="text-gray-400 font-bold uppercase text-xs tracking-wider">Total a Pagar</span>
                    </div>
                    <div className="flex mb-4">
                        <span className="text-gray-900 text-4xl font-extrabold">
                            ${total.toFixed(2)}
                        </span>

                    </div>

                    <button
                        disabled={items.length === 0}
                        onClick={() => setModalCheckout(true)}
                        className={`w-full py-5 rounded-xl font-bold text-xl shadow-lg transition-all transform active:scale-[0.98]
                            ${items.length > 0
                                ? 'bg-green-600 text-white hover:bg-green-700 shadow-green-200/50'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        Confirmar Orden
                    </button>
                </div>
            </aside>

            {/* --- MODAL: CHECKOUT (SELECCIÓN DE ENTREGA) --- */}
            {modalCheckout && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl p-8 max-w-lg w-full">
                        <h3 className="text-3xl font-bold text-center mb-6 text-gray-800">¿Para dónde es?</h3>
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <button onClick={() => setTipoEntrega('COMER_AQUI')} className={`p-6 rounded-2xl border-4 font-bold transition-all ${tipoEntrega === 'COMER_AQUI' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-100 text-gray-400'}`}>
                                <span className="text-3xl block mb-2"></span> Para Comer Aquí
                            </button>
                            <button onClick={() => setTipoEntrega('LLEVAR')} className={`p-6 rounded-2xl border-4 font-bold transition-all ${tipoEntrega === 'LLEVAR' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-100 text-gray-400'}`}>
                                <span className="text-3xl block mb-2"></span> Para Llevar
                            </button>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setModalCheckout(false)} className="flex-1 py-4 font-bold bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Volver</button>
                            <button onClick={handleConfirmarOrden} disabled={enviandoOrden} className="flex-2 py-4 font-bold text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors shadow-lg">
                                {enviandoOrden ? 'Enviando...' : 'Finalizar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL : PANTALLA DE ÉXITO  --- */}
            {ordenExitosa !== null && (
                <div className="fixed inset-0 bg-white z-60 flex flex-col items-center justify-center animate-fade-in">
                    <div className="absolute top-0 bg-orange-500 w-fit px-12 pb-4 pt-2 rounded-b-3xl shadow-lg">
                        <img src={gabunniLogo} className="h-20 object-contain brightness-0 invert" alt="Gabunni" />
                    </div>

                    <div className="border-4 border-orange-500 rounded-[3rem] p-12 max-w-4xl w-full text-center mt-10 shadow-2xl bg-white">
                        <div className="text-[150px] font-extrabold text-orange-500 leading-none mb-4 drop-shadow-sm">
                            #{ordenExitosa.toString().padStart(2, '0')}
                        </div>
                        <h2 className="text-4xl text-orange-800 font-bold mb-6">Tu pedido está creado!</h2>
                        <p className="text-2xl text-gray-600 mb-12 font-medium">
                            Pasa a caja y menciona el número <strong className="text-orange-600 text-3xl">#{ordenExitosa.toString().padStart(2, '0')}</strong> para pagar.
                        </p>
                        <button onClick={handleFinalizar} className="bg-white border-2 border-orange-500 text-orange-500 text-2xl font-bold py-4 px-20 rounded-full hover:bg-orange-500 hover:text-white transition-all duration-300 shadow-md">
                            Finalizar
                        </button>
                    </div>

                    <p className="absolute bottom-10 text-gray-400 font-medium">
                        Esta ventana se cerrará automáticamente en {segundosRestantes}s
                    </p>
                </div>
            )}

            {showModalPersonalizar && (
                <ModalPersonalizadorKiosco onClose={() => setShowModalPersonalizar(false)} />
            )}

            {productoSeleccionado && (
                <ModalDetalleProducto
                    producto={productoSeleccionado}
                    onClose={() => setProductoSeleccionado(null)}
                    onAddToCart={handleAddProductoDesdeModal}
                    onPersonalizar={handlePersonalizarDesdeModal}
                />
            )}

            {paqueteSeleccionado && (
                <ModalDetallePaquete 
                    paquete={paqueteSeleccionado}
                    onClose={() => setPaqueteSeleccionado(null)}
                    onAddToCart={handleAddPaqueteDesdeModal}
                />
            )}

        </div>
    );
};

export default MenuKiosco;