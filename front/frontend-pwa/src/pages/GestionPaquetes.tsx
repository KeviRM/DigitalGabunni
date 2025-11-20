// frontend-pwa/src/pages/GestionPaquetes.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import type{ Producto } from '../types/menu'; 
import { FaTrashAlt, FaEdit, FaPlus, FaGift } from 'react-icons/fa';
import ImageUploader from '../components/ImageUploader';



// Interfaz para el paquete
interface PaqueteGestion {
    id?: number;
    name: string;
    description: string;
    price: string;
    discount: string;
    is_active: boolean;
    image?: string;
    items: PaqueteItem[];
}

interface PaqueteItem {
    id: number;
    product: number;
    product_name: string;
    quantity: number;
}




const CATALOGO_API_URL = 'http://127.0.0.1:8000/api/v1/catalogo/admin/';

const GestionPaquetes: React.FC = () => {
    const { isAuthenticated, getAuthHeaders } = useAuth();
    const navigate = useNavigate();
    const AUTH_HEADERS = { headers: getAuthHeaders() };

    const [paquetes, setPaquetes] = useState<PaqueteGestion[]>([]);
    const [productosBase, setProductosBase] = useState<Producto[]>([]);

    //Estado Form(paquete)
    const [paqueteEditando, setPaqueteEditando] = useState<PaqueteGestion | null>(null);
    const [formPaquete, setFormPaquete] = useState<Partial<PaqueteGestion>>({
        name:'', description: '',price: '', discount: '0', is_active: true
    });
    const [fileUpload, setFileUpload] = useState<File | null>(null);

    //Estado items forms
    const[itemForm, setItemForm] = useState({ product: '', quantity: 1});



    const [cargando, setCargando] = useState(true);



    const fetchDatos = async () => {
        if (!isAuthenticated) return;
        setCargando(true);
        try {
            const [paqRes, prodRes] = await Promise.all([
                axios.get<PaqueteGestion[]>(`${CATALOGO_API_URL}gestion/paquetes/`, AUTH_HEADERS),
                axios.get<Producto[]>(`${CATALOGO_API_URL}gestion/productos/`, AUTH_HEADERS),
            ]);
            setPaquetes(paqRes.data);
            setProductosBase(prodRes.data);


            // Si estamos editando, actualizamos el objeto en edición con los datos frescos
            if (paqueteEditando?.id) {
                const actualizado = paqRes.data.find(p => p.id === paqueteEditando.id);
                if (actualizado) setPaqueteEditando(actualizado);
            }
        } catch (err) {
            console.error("Error al cargar datos:", err);
            alert("Error al cargar datos. Verifica la autenticación.");
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchDatos();
        } else {
            navigate('/admin');
        }
    }, [isAuthenticated]);


////////Guardar paquete C/U con image
    const handleSavePaquete = async (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();

        formData.append('name', formPaquete.name || '');
        formData.append('description', formPaquete.description || '');
        formData.append('price', formPaquete.price || '0');
        formData.append('discount', formPaquete.discount || '0');
        formData.append('is_active', formPaquete.is_active ? 'true' : 'false');


        if(fileUpload){
            formData.append('image', fileUpload);
        }
        const headers = { ...AUTH_HEADERS.headers, 'Content-Type': 'multipart/form-data' };

        try{
            if (paqueteEditando?.id){
                const res = await axios.patch(`${CATALOGO_API_URL}gestion/paquetes/${paqueteEditando.id}/`, formData, { headers });
                setPaqueteEditando(res.data);
                alert("Producto actualizado.");
            } else {
                const res = await axios.post(`${CATALOGO_API_URL}gestion/paquetes/`, formData, { headers });
                setPaqueteEditando(res.data);
                alert("Paquete Creado. Ahora añade los productos.");
            }
            setFileUpload(null);
            fetchDatos();
        } catch(err){

            console.error(err);
            alert("Error al guardar paquete");
        }

    }

    ///////Delete paquete

    const handleDeletePaquete = async (id: number) => {
            if(!window.confirm("¿Eliminar este paquete?")) return;
            try {
                await axios.delete(`${CATALOGO_API_URL}gestion/paquetes/${id}/`, AUTH_HEADERS);
                setPaqueteEditando(null);
                fetchDatos();
            } catch(err) {console.error(err); alert("Error al eliminar"); }
        };



    //////Añadir producto al paquete


    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!paqueteEditando?.id) return;

        try{
            await axios.post(`${CATALOGO_API_URL}gestion/paquete-items/`,{
                package: paqueteEditando.id,
                product: Number(itemForm.product),
                quantity: itemForm.quantity
            }, AUTH_HEADERS);

            setItemForm({ product:'', quantity: 1 });
            fetchDatos();
        } catch(err){
            console.error(err);
            alert("Error al añadir producto");
        }
    };


///// Eliminar Item del Paquete
    const handleDeleteItem = async (itemId: number) => {
        try {
            await axios.delete(`${CATALOGO_API_URL}gestion/paquete-items/${itemId}/`, AUTH_HEADERS);
            fetchDatos();
        } catch (err) { console.error(err); alert("Error al quitar producto."); }
    };


    // Preparar formulario para editar
    const startEditing = (paquete: PaqueteGestion) => {
        setPaqueteEditando(paquete);
        setFormPaquete(paquete);
        setFileUpload(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Limpiar formulario para crear nuevo
    const startCreating = () => {
        setPaqueteEditando(null);
        setFormPaquete({ name: '', description: '', price: '', discount: '0', is_active: true });
        setFileUpload(null);
    };



    if (!isAuthenticated || cargando && paquetes.length === 0) return <div className="text-center p-20">Cargando...</div>;



    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="flex justify-between items-center mb-8 border-b-4 border-orange-500 pb-2 max-w-7xl mx-auto">
                <h1 className="text-4xl font-extrabold text-gray-800">Gestión de Paquetes </h1>
                <button onClick={startCreating} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 flex items-center">
                    <FaPlus className="mr-2"/> Nuevo Paquete
                </button>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* --- COLUMNA IZQUIERDA: Formulario Principal (4 columnas) --- */}
                <div className="lg:col-span-4 bg-white p-6 rounded-xl shadow-lg h-fit">
                    <h2 className="text-2xl font-bold text-orange-600 mb-4">
                        {paqueteEditando ? 'Editar Paquete' : 'Crear Paquete'}
                    </h2>
                    
                    <form onSubmit={handleSavePaquete} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nombre del Paquete</label>
                            <input 
                                type="text" 
                                className="w-full p-2 border rounded" 
                                value={formPaquete.name}
                                onChange={e => setFormPaquete({...formPaquete, name: e.target.value})}
                                required 
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Descripción</label>
                            <textarea 
                                className="w-full p-2 border rounded" 
                                rows={3}
                                value={formPaquete.description}
                                onChange={e => setFormPaquete({...formPaquete, description: e.target.value})}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Precio ($)</label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    className="w-full p-2 border rounded"
                                    value={formPaquete.price}
                                    onChange={e => setFormPaquete({...formPaquete, price: e.target.value})}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Descuento (%)</label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    className="w-full p-2 border rounded"
                                    value={formPaquete.discount}
                                    onChange={e => setFormPaquete({...formPaquete, discount: e.target.value})}
                                />
                            </div>
                        </div>

                        {/* Componente de Imagen */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Foto del Paquete </label>
                            <ImageUploader 
                                currentImageUrl={paqueteEditando?.image}
                                onFileSelect={setFileUpload}
                                disabled={false}
                            />
                        </div>

                        <div className="flex items-center">
                            <input 
                                type="checkbox" 
                                checked={formPaquete.is_active}
                                onChange={e => setFormPaquete({...formPaquete, is_active: e.target.checked})}
                                className="mr-2 h-5 w-5 text-orange-600"
                            />
                            <label className="text-sm font-medium text-gray-700">Paquete Activo (Visible)</label>
                        </div>

                        <button type="submit" className="w-full py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600">
                            {paqueteEditando ? 'Guardar Cambios' : 'Crear Paquete'}
                        </button>
                    </form>
                </div>

                {/* --- COLUMNA DERECHA: Contenido (8 columnas) --- */}
                <div className="lg:col-span-8 space-y-8">
                    
                    {/* 1. Gestión de Items (Solo si editando) */}
                    {paqueteEditando && (
                        <div className="bg-orange-50 p-6 rounded-xl border-2 border-orange-200">
                            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                <FaGift className="mr-2"/> Contenido de: {paqueteEditando.name}
                            </h3>

                            {/* Lista de Items */}
                            <div className="space-y-2 mb-6">
                                {paqueteEditando.items.length === 0 ? (
                                    <p className="text-gray-500 italic">No hay productos en este paquete aún.</p>
                                ) : (
                                    paqueteEditando.items.map(item => (
                                        <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded shadow-sm">
                                            <span><span className="font-bold">{item.quantity}x</span> {item.product_name}</span>
                                            <button onClick={() => handleDeleteItem(item.id)} className="text-red-500 hover:text-red-700 text-sm font-semibold">
                                                Quitar
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Formulario Añadir Item */}
                            <form onSubmit={handleAddItem} className="flex gap-2 items-end bg-white p-3 rounded-lg shadow-sm">
                                <div className="grow">
                                    <label className="block text-xs font-bold text-gray-500 uppercase">Producto</label>
                                    <select 
                                        className="w-full p-2 border rounded"
                                        value={itemForm.product}
                                        onChange={e => setItemForm({...itemForm, product: e.target.value})}
                                    >
                                        <option value="">-- Seleccionar --</option>
                                        {productosBase.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div className="w-24">
                                    <label className="block text-xs font-bold text-gray-500 uppercase">Cant.</label>
                                    <input 
                                        type="number" min="1" 
                                        className="w-full p-2 border rounded"
                                        value={itemForm.quantity}
                                        onChange={e => setItemForm({...itemForm, quantity: Number(e.target.value)})}
                                    />
                                </div>
                                <button type="submit" className="py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 font-bold">
                                    <FaPlus />
                                </button>
                            </form>
                        </div>
                    )}

                    {/* 2. Lista de Paquetes Existentes */}
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Paquetes Disponibles</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {paquetes.map(paq => (
                                        <tr key={paq.id} className={paqueteEditando?.id === paq.id ? "bg-blue-50" : ""}>
                                            <td className="px-4 py-3 font-medium">{paq.name}</td>
                                            <td className="px-4 py-3 text-green-600 font-bold">${Number(paq.price).toFixed(2)}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500">{paq.items.length} productos</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${paq.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {paq.is_active ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right space-x-3">
                                                <button onClick={() => startEditing(paq)} className="text-blue-600 hover:text-blue-800"><FaEdit /></button>
                                                <button onClick={() => handleDeletePaquete(paq.id!)} className="text-red-600 hover:text-red-800"><FaTrashAlt /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>
        </div>
        
    );
};

export default GestionPaquetes;