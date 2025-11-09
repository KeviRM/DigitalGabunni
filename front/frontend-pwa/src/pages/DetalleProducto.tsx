import React, {useState, useEffect,useMemo} from "react";
import { useParams, useNavigate } from "react-router-dom";
import type{ Producto, ClaseIngrediente, Ingrediente } from "../types/menu";
import { fetchProductoById, fetchClasesIngredientes } from "../api/menuApi";



import { useCarrito } from "../context/CarritoContext";

interface Selecciones{
    [claseId: number]: Ingrediente[];

}


const DetalleProducto: React.FC = () => {
    const { productoId } = useParams<{ productoId: string}>();
    const navigate = useNavigate();

    

    const [producto, setProducto] = useState< Producto | null>(null);
    const [clases, setClases] = useState<ClaseIngrediente[]>([]);

    const [selecciones, setSelecciones] = useState<Selecciones>({});
    const [cargando, setCargando] = useState(true);

    // Carga de datos

    useEffect(() => {
        const id = parseInt(productoId || '0');
        if (id === 0){
            navigate('/');
            return;
        }



        const cargarDatos = async () => {

            const [prodData, clasesData] = await Promise.all([
                fetchProductoById(id),
                fetchClasesIngredientes()
            ]);

            if (prodData){

                setProducto(prodData);
                setClases(clasesData);

            } else {
                alert("Error: Producto no encontrado.");
                navigate('/');
            }
            setCargando(false);

        };
        cargarDatos();


    }, [productoId, navigate]);


    //carrito

    const { agregarItem } = useCarrito(); 






    // Logica de Personalizacion


    const precioBase = producto ? parseFloat(producto.price) : 0;

    const handleSeleccion = (claseId: number, ingrediente: Ingrediente) => {


        //seleccion

        const clase = clases.find(c => c.id === claseId);
        if(!clase) return;


        setSelecciones(prev => {
            const ingredientesActuales = prev[claseId] || [];
            const yaSeleccionado = ingredientesActuales.some(i => i.id === ingrediente.id);
            

            let nuevosIngredientes: Ingrediente[];


            if(yaSeleccionado){
                
                nuevosIngredientes = ingredientesActuales.filter(i => i.id !== ingrediente.id);

            } else{
                if(clase.required){
                    
                    nuevosIngredientes = [ingrediente];
                    
                } else {
                    nuevosIngredientes = [...ingredientesActuales, ingrediente];

                }
            }
            return {...prev, [claseId]: nuevosIngredientes};

        });

    };







    const precioTotal = useMemo(() => {
        // Lógica de cálculo 
        let costoAdicional = 0;
        Object.values(selecciones).forEach(ingredientes => {
            ingredientes.forEach((ing: { additional_price: string; }) => {
                costoAdicional += parseFloat(ing.additional_price);
            });
        });
        return precioBase + costoAdicional;
    }, [selecciones, precioBase]);




    const isFormValid = useMemo(() => {
        // (Lógica de validación 
        return clases.every(clase => {
            if (clase.required) {
                const seleccion = selecciones[clase.id];
                return seleccion && seleccion.length > 0;
            }
            return true;
        });
    }, [clases, selecciones]);





    const handleConfirmarPedido = () => {
        if (isFormValid && producto) {
            


            const itemParaCarrito = {
                productoBase: producto,
                precioUnitario: precioTotal,
                personalizacion: selecciones,

            };

            agregarItem(itemParaCarrito);

            alert(`"${producto.name}" personalizada añadida al carrito por $${precioTotal.toFixed(2)}.`);

            // Navegar de vuelta al carrito
            navigate('/carrito'); 
        } else {
            alert("Por favor, selecciona al menos una opción para todas las categorías obligatorias.");
        }
    };








    // --- Renderizado ---
    if (cargando || !producto) {
        return <div className="text-center p-8 text-xl font-medium">Cargando Detalle de Producto...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-10">
            <button 
                onClick={() => navigate('/')} 
                className="text-green-900 hover:text-green-800 font-semibold mb-6 flex items-center"
            >
                &larr; Volver al Menú
            </button>
            
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">

                <div className="md:flex">
                    {/* Sección de Imagen y Descripción del Producto Base */}
                    <div className="md:w-1/2 p-6">
                        <img 
                            src={producto.image || 'https://1.bp.blogspot.com/-JUmaXrEYbPs/XnPhc3k7V0I/AAAAAAAAN0A/reZohppseB4uFlD3L6JS5Xv6yngGprCZgCLcBGAsYHQ/s1600/chapata.jpg'} 
                            alt={producto.name} 
                            className="w-full h-auto rounded-lg mb-4 shadow-md"
                        />
                        <h1 className="text-3xl font-bold text-orange-700">{producto.name}</h1>
                        <p className="text-gray-600 mt-2">{producto.description}</p>
                        <p className="text-xl font-semibold mt-4 text-gray-800">
                           Precio Base: ${precioBase.toFixed(2)}
                        </p>
                    </div>

                    {/* Sección de Personalización */}
                    <div className="md:w-1/2 p-6 bg-gray-50 border-l">
                        <h2 className="text-2xl font-extrabold text-yellow-600 mb-6">
                            Arma tu Chapata
                        </h2>

                        {/* Iterar sobre las Clases de Ingredientes */}
                        {clases.map(clase => (
                            <div key={clase.id} className="mb-6 p-4 border rounded-lg bg-white shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                                    {clase.name} 
                                    {clase.required && <span className="text-red-500 text-sm ml-2"> (Requerido)</span>}
                                </h3>

                                <div className="flex flex-wrap gap-2">
                                    {clase.ingredientes.map(ingrediente => {
                                        const isSelected = (selecciones[clase.id] || []).some(i => i.id === ingrediente.id);
                                        
                                        return (
                                            <button
                                                key={ingrediente.id}
                                                onClick={() => handleSeleccion(clase.id, ingrediente)}
                                                className={`px-3 py-1 rounded-full text-sm border transition-colors duration-200 
                                                            ${isSelected 
                                                                ? 'bg-green-500 text-white border-green-700' 
                                                                : 'bg-white text-gray-700 hover:bg-green-50 border-gray-300'
                                                            }`}
                                            >
                                                {ingrediente.name} 
                                                {Number(ingrediente.additional_price) > 0 && 
                                                    <span className="ml-1 text-xs font-medium"> 
                                                      (+${Number(ingrediente.additional_price).toFixed(2)}) 
                                                    </span>
                                                }
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}

                    </div>
                </div>
                
                {/* Footer del Precio y Botón de Confirmación */}
                <div className="bg-white p-6 border-t flex justify-between items-center sticky bottom-0">
                    <div className="text-3xl font-extrabold text-gray-900">
                        Total : <span className="text-yellow-600">${precioTotal.toFixed(2)}</span>
                    </div>

                    <button
                        onClick={handleConfirmarPedido}
                        disabled={!isFormValid}
                        className={`px-8 py-3 text-white rounded-lg font-bold transition-all ${
                            isFormValid 
                              ? 'bg-orange-600 hover:bg-orange-700 shadow-lg' 
                              : 'bg-gray-400 cursor-not-allowed opacity-60'
                        }`}
                    >
                        Añadir al Carrito
                    </button>
                </div>
            </div>
        </div>
    );


 




};

export default DetalleProducto;
