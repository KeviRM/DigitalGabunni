import React, { useState, useEffect, useMemo } from 'react';
import { FaSearch, FaPencilAlt, FaTrash } from 'react-icons/fa';
// Importa tus tipos y llamadas a la API
// import type { Producto } from '../../types/menu';
// import { catalogoApi, pedidosApi } from '../../api';

const PuntoDeVenta = () => {
    // --- ESTADOS DEL CATÁLOGO ---
    const [productos, setProductos] = useState<any[]>([]); // Reemplaza any con tu tipo Producto
    const [categorias, setCategorias] = useState<string[]>(['Paquetes', 'Chapatas', 'Bebidas']);
    const [categoriaActiva, setCategoriaActiva] = useState('Chapatas');
    const [busqueda, setBusqueda] = useState('');

    // --- ESTADOS DEL CARRITO ---
    const [carrito, setCarrito] = useState<any[]>([]); // Tus items del carrito
    const totalCarrito = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

    // --- EFECTO: Cargar Productos ---
    useEffect(() => {
        // Aquí llamas a tu backend para traer los productos (igual que en el kiosco)
        // fetchProductos();
    }, []);

    // --- FILTRADO RÁPIDO ---
    const productosMostrar = useMemo(() => {
        return productos.filter(p => 
            p.category_name === categoriaActiva &&
            p.name.toLowerCase().includes(busqueda.toLowerCase())
        );
    }, [productos, categoriaActiva, busqueda]);

    // --- ACCIONES DEL CAJERO ---
    const agregarAlCarritoRapido = (producto: any) => {
        // Para la caja, un clic agrega el producto base inmediatamente para mayor velocidad.
        // Si el cliente quiere extras, el cajero usará el botón de "Editar" (Lápiz).
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

    const handleCobrar = async () => {
        if (carrito.length === 0) return alert("El carrito está vacío");
        
        // Aquí enviaremos el pedido a Django con origen='CAJA' y status='CONFIRMADO' (o pagado)
        console.log("Enviando orden...", carrito);
        // await pedidosApi.post('/api/v1/pedidos/', { ... })
    };

    return (
        <div className="flex h-screen bg-gray-50 p-4 gap-6">
            
            {/* === COLUMNA IZQUIERDA: CARRITO / NUEVA ORDEN === */}
            <div className="w-1/3 bg-white rounded-3xl shadow-lg flex flex-col border-t-4 border-orange-500 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-2xl font-bold text-orange-500 text-center">Nueva Orden</h2>
                </div>

                {/* Lista de Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {carrito.length === 0 ? (
                        <p className="text-center text-gray-400 mt-10">Agrega productos para comenzar</p>
                    ) : (
                        carrito.map(item => (
                            <div key={item.idUnico} className="border border-orange-200 bg-orange-50/30 rounded-xl p-4 flex flex-col gap-2">
                                <div className="flex justify-between items-start font-bold text-gray-800 text-lg">
                                    <span>{item.cantidad}x {item.producto.name}</span>
                                    <span className="text-green-600">${(item.precio * item.cantidad).toFixed(2)}</span>
                                </div>
                                
                                {/* Aquí iría el renderizado de extras (igual al kiosco) */}
                                <div className="text-sm pl-6">
                                    {/* <p className="text-gray-400">- sin cebolla</p> */}
                                    {/* <p className="text-green-600 font-bold">+ queso extra</p> */}
                                </div>

                                {/* Botones de acción del item */}
                                <div className="flex justify-end gap-3 mt-2">
                                    <button className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition shadow-sm">
                                        <FaPencilAlt />
                                    </button>
                                    <button onClick={() => eliminarDelCarrito(item.idUnico)} className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition shadow-sm">
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer de Cobro */}
                <div className="bg-white border-t-2 border-dashed border-gray-200 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-gray-500 font-bold uppercase tracking-wider text-sm">Total a Pagar</span>
                        <span className="text-4xl font-extrabold text-orange-500">${totalCarrito.toFixed(2)}</span>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => setCarrito([])} className="flex-1 py-3 text-red-500 border-2 border-red-500 font-bold rounded-xl hover:bg-red-50 transition">
                            Cancelar
                        </button>
                        <button onClick={handleCobrar} className="flex-2 w-2/3 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition shadow-lg text-lg">
                            Cobrar Orden
                        </button>
                    </div>
                </div>
            </div>

            {/* === COLUMNA DERECHA: CATÁLOGO DE PRODUCTOS === */}
            <div className="w-2/3 flex flex-col gap-6">
                
                {/* Cabecera: Categorías y Buscador */}
                <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm">
                    <div className="flex gap-4">
                        {categorias.map(cat => (
                            <button 
                                key={cat}
                                onClick={() => setCategoriaActiva(cat)}
                                className={`px-6 py-3 rounded-xl font-bold transition-all border-2 
                                    ${categoriaActiva === cat ? 'border-orange-500 text-orange-500 bg-orange-50' : 'border-transparent text-gray-500 hover:bg-gray-100'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                    
                    <div className="relative">
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

                {/* Grid de Productos */}
                <div className="flex-1 overflow-y-auto">
                    <h3 className="text-3xl font-light text-gray-400 mb-6">{categoriaActiva}</h3>
                    <div className="grid grid-cols-3 xl:grid-cols-4 gap-4 pr-2">
                        {productosMostrar.map(prod => (
                            <button 
                                key={prod.id} 
                                onClick={() => agregarAlCarritoRapido(prod)}
                                className="bg-white border-2 border-gray-100 rounded-2xl p-4 flex flex-col items-center justify-center hover:border-orange-400 hover:shadow-md transition-all active:scale-95 group h-32"
                            >
                                <span className="font-bold text-gray-700 text-center leading-tight group-hover:text-orange-500">{prod.name}</span>
                                <span className="text-green-600 font-extrabold mt-2">${parseFloat(prod.price).toFixed(2)}</span>
                            </button>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default PuntoDeVenta;