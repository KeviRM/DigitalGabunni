import React, { useEffect, useState } from "react";
import axios from "axios";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";



interface Unidad {
    id: number;
    name: string;
    abbreviation: string;
}

const CATALOGO_API_URL = 'http://127.0.0.1:8000/api/v1/catalogo/admin/gestion/';



const GestionUnidades: React.FC = () => {
    const {isAuthenticated, getAuthHeaders} = useAuth();
    const navigate = useNavigate();
    const AUTH_HEADERS = { headers: getAuthHeaders()};


    const [unidades, setUnidades] = useState<Unidad[]>([]);
    const [nuevaUnidad, setNuevaUnidad] = useState({name: '', abbreviation:''});
    const[cargando, setCargando] = useState(true);



    // Carga de datos


    const fetchUnidades = async () => {
        if (!isAuthenticated) return;
        setCargando(true);

        try{
            const response = await axios.get<Unidad[]>(`${CATALOGO_API_URL}unidades/`, AUTH_HEADERS);
            setUnidades(response.data);

        } catch (err){
            console.error("Error al cargar unidades:", err);
            alert("No se pudieron cargar las unidades. Revisa la autenticacion");

        } finally {
            setCargando(false);
        }
    };


    useEffect(() => {
        if(isAuthenticated){
            fetchUnidades();

        } else{
            navigate('/admin');
        }
    }, [isAuthenticated]);


    //Crear

    const handleSubmit = async (e: React.FormEvent) => {

        e.preventDefault();
        try {
            const response = await axios.post(`${CATALOGO_API_URL}unidades/`, nuevaUnidad, AUTH_HEADERS);
            setUnidades([...unidades, response.data]);
            setNuevaUnidad({ name: '', abbreviation: '' });
        } catch (err) {
            
             console.error("Error al crear unidad:", err);

            alert("Error al crear unidad. Podría ya existir.");
        }

    };




    const handleDelete = async (id: number) => {


        if(!window.confirm("¿Estas seguro de eliminar esta unidad?")) return;
        try {
            await axios.delete(`${CATALOGO_API_URL}unidades/${id}/`, AUTH_HEADERS);
            setUnidades(unidades.filter(u => u.id !== id));
        } catch (err) {
            console.error("Error al eliminar la unidad:", err);

            alert("Error al eliminar. Podría estar en uso por un ingrediente.");
        }

    }










    if (!isAuthenticated || cargando) return <div className="text-center p-20">Cargando...</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 max-w-4xl mx-auto border-b pb-2">
                Gestión de Unidades de Medida 
            </h1>

            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Columna 1: Formulario */}
                <div className="bg-white p-6 rounded-xl shadow-lg h-fit">
                    <h2 className="text-xl font-bold text-green-700 mb-4">Añadir Nueva Unidad</h2>
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            placeholder="Nombre (Ej: Gramos)"
                            value={nuevaUnidad.name}
                            onChange={(e) => setNuevaUnidad({ ...nuevaUnidad, name: e.target.value })}
                            className="w-full p-2 border rounded-lg mb-3"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Abreviatura (Ej: g)"
                            value={nuevaUnidad.abbreviation}
                            onChange={(e) => setNuevaUnidad({ ...nuevaUnidad, abbreviation: e.target.value })}
                            className="w-full p-2 border rounded-lg mb-4"
                            required
                        />
                        <button type="submit" className="w-full py-2 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600">
                            Guardar Unidad
                        </button>
                    </form>
                </div>

                {/* Columna 2: Listado */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Unidades Existentes</h2>
                    <ul className="divide-y divide-gray-200">
                        {unidades.map(unidad => (
                            <li key={unidad.id} className="py-3 flex justify-between items-center">
                                <div>
                                    <span className="font-semibold">{unidad.name}</span>
                                    <span className="text-sm text-gray-500 ml-2">({unidad.abbreviation})</span>
                                </div>
                                <button
                                    onClick={() => handleDelete(unidad.id)}
                                    className="text-red-500 hover:text-red-700 text-sm"
                                >
                                    Eliminar
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );







};





export default GestionUnidades;

