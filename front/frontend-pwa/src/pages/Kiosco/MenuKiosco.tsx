import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// --- IMPORTS DE TU LÓGICA REAL ---
import { fetchCategorias, fetchProductos, fetchPaquetes } from '../../api/menuApi';
// import type { Producto, Categoria, Paquete, ItemCarrito } from '../../types/menu'; // <-- COMENTADO para evitar conflictos de tipo "precioUnitario"
import { pedidosApi } from '../../api/axiosConfig';
import useAuth from '../../hooks/useAuth';

// --- IMPORT DEL CONTEXTO KIOSCO (EL MOTOR REAL) ---
import { useKiosco } from '../../context/KioscoContext';
import ModalPersonalizadorKiosco from './ModalPersonalizadorKiosco';

// --- IMPORTS DE ICONOS Y ASSETS ---
import { FaShoppingCart, FaChevronLeft, FaTrash, FaUtensils, FaBoxOpen } from 'react-icons/fa';
import gabunniLogo from '../../assets/gabunniLogo.jpg';

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

    // Estados para Checkout 
    const [modalCheckout, setModalCheckout] = useState(false);
    const [tipoEntrega, setTipoEntrega] = useState<'COMER_AQUI' | 'LLEVAR'>('COMER_AQUI');
    const [enviandoOrden, setEnviandoOrden] = useState(false);
    const [showModalPersonalizar, setShowModalPersonalizar] = useState(false);

    // --- CARGA DE DATOS ---
    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const [prods, cats, paqs] = await Promise.all([fetchProductos(), fetchCategorias(), fetchPaquetes()]);
                setProductos(prods);
                setPaquetes(paqs);

                if (paqs.length > 0) {
                    // Forzamos any para evitar errores de TS con tipos viejos
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

    // --- FILTRADO ---
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

    // --- MANEJADORES ---

    // Simplificamos: El contexto Kiosco ya sabe cómo extraer precios y nombres
    const handleAddProducto = (producto: any) => {

        agregarItem(producto, false);
    };

    const handleAddPaqueteToCart = (paquete: any) => {
        // true = es paquete
        agregarItem(paquete, true);
    };

    // --- CONFIRMAR ORDEN ---
    const handleConfirmarOrden = async () => {
        setEnviandoOrden(true);
        try {
            const payload = {
                items: items.map(item => ({
                    product_id: item.esPaquete ? -item.producto.id : item.producto.id,
                    quantity: item.cantidad,
                    is_package: item.esPaquete,
                    package_data: item.esPaquete ? item.producto : null
                })),
                type_delivery: tipoEntrega,
                total: total
            };

            const res = await pedidosApi.post('/api/v1/pedidos/crear/', payload, { headers: getAuthHeaders() });
            alert(` Pedido #${res.data.order_number} Creado.`);
            limpiarCarrito();
            setModalCheckout(false);
            navigate('/kiosco');
        } catch (error) {
            console.error(error);
            alert("Error al crear pedido.");
        } finally {
            setEnviandoOrden(false);
        }
    };

    if (cargando) return <div className="flex h-screen items-center justify-center text-3xl font-bold text-gray-400 animate-pulse">Cargando Menú... 🍔</div>;

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans select-none">

            {/* --- COLUMNA : CATEGORÍAS  --- */}
            <aside className="w-1/5 bg-white shadow-xl z-20 flex flex-col">
                <div className="p-6 border-b border-gray-100 flex justify-center bg-white">
                    <img src={gabunniLogo} alt="Logo" className="w-32 object-contain" />
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {categorias.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setFiltroActivo(cat.id)}
                            className={`w-full py-6 px-4 rounded-2xl text-xl font-bold transition-all transform duration-200 border-2 shadow-sm text-left flex items-center justify-between
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
                        className="w-full py-4 rounded-xl border-2 border-red-100 text-red-400 font-bold flex items-center justify-center gap-2 hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                        <FaChevronLeft /> Cancelar Orden
                    </button>
                </div>
            </aside>

            {/* ---  GRID DE PRODUCTOS --- */}
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
                        <div key={paq.id} className="bg-white rounded-3xl shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-[380px] group border border-gray-100">
                            <div className="h-48 bg-gray-100 relative overflow-hidden shrink-0">
                                <img
                                    src={paq.image || 'https://via.placeholder.com/300'}
                                    alt={paq.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-1 rounded-full font-extrabold shadow-lg text-lg">
                                    ${parseFloat(paq.price).toFixed(0)}
                                </div>
                            </div>
                            <div className="p-5 flex-1 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 leading-tight mb-2">{paq.name}</h3>
                                    <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">{paq.description}</p>
                                </div>
                                <button
                                    onClick={() => handleAddPaqueteToCart(paq)}
                                    className="w-full mt-2 bg-orange-50 hover:bg-orange-500 text-orange-600 hover:text-white font-bold py-3 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    Agregar Paquete
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* PRODUCTOS REGULARES */}
                    {productosFiltrados.map(prod => (
                        <div key={prod.id} className="bg-white rounded-3xl shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-[380px] group border border-gray-100">
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
                                        onClick={() => navigate(`/producto/${prod.id}`)}
                                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-3 rounded-xl transition-colors text-sm"
                                    >
                                        Detalles
                                    </button>
                                    <button
                                        onClick={() => handleAddProducto(prod)}
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

            {/* --- COLUMNA  CARRITO  --- */}
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
                            <div key={item.idUnico} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 animate-fade-in-up">
                                <div className="flex justify-between items-start mb-2">
                                    <p className="font-bold text-sm text-gray-800 line-clamp-2 leading-tight flex-1 pr-2">
                                        {item.producto.name}
                                    </p>
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

                <div className="p-6 bg-white border-t border-gray-200 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
                    <div className="flex justify-between items-end mb-4">
                        <span className="text-gray-400 font-bold uppercase text-xs tracking-wider">Total a Pagar</span>
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

            {/* MODAL CHECKOUT */}
            {modalCheckout && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl p-8 max-w-lg w-full">
                        <h3 className="text-3xl font-bold text-center mb-6">¿Para dónde es?</h3>
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <button onClick={() => setTipoEntrega('COMER_AQUI')} className={`p-6 rounded-2xl border-4 font-bold ${tipoEntrega === 'COMER_AQUI' ? 'border-orange-500 bg-orange-50' : 'border-gray-100'}`}>Para Comer Aquí</button>
                            <button onClick={() => setTipoEntrega('LLEVAR')} className={`p-6 rounded-2xl border-4 font-bold ${tipoEntrega === 'LLEVAR' ? 'border-orange-500 bg-orange-50' : 'border-gray-100'}`}>Para Llevar</button>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setModalCheckout(false)} className="flex-1 py-4 font-bold bg-gray-100 rounded-xl">Volver</button>
                            <button onClick={handleConfirmarOrden} disabled={enviandoOrden} className="flex-2 py-4 font-bold text-white bg-green-600 rounded-xl">{enviandoOrden ? '...' : 'Finalizar'}</button>
                        </div>
                    </div>
                </div>
            )}

            {showModalPersonalizar && (
                <ModalPersonalizadorKiosco onClose={() => setShowModalPersonalizar(false)} />
            )}

        </div>
    );
};

export default MenuKiosco;