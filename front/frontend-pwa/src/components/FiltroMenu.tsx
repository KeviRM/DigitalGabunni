import React from "react";
import type{ Categoria } from "../types/menu";


interface FiltrosMenuProp{
    categorias : Categoria[];
    filtroActivo: number | null;
    onSelectFiltro: (categoriaId: number| null) => void;
}

const FiltrosMenu: React.FC<FiltrosMenuProp> = ({ categorias, filtroActivo, onSelectFiltro }) => {
    return(

        <div className="flex justify-center flex-wrap gap-3 p-4 bg-white shadow-md rounded-lg mx-auto max-w-3xl">



            {/* boton para mostrar todo */}

            <button
            onClick={() => onSelectFiltro(null)}
            
            className={`px-5 py-2 rounded-full font-semibold transitions-color duration-200
                                ${
                                    filtroActivo === null
                                    ? 'bg-amber-600 text-white hover:bg-amber-400'
                                    : 'bg-gray-200 text-gray-800 hover:bg-amber-300'
                                }
            `}
            >

                Todos
            </button>

            {/* boton de categorias */}

           {categorias.map(categoria=>(
                <button 
                    key={categoria.id}
                    onClick={() => onSelectFiltro(categoria.id)}
                    className={`px-5 py-2 rounded-full font-semibold transition-colors duration-200
                                ${filtroActivo === categoria.id
                                    ? 'bg-green-600 text-white shadow-md'
                                    : 'bg-gray-200 text-gray-700 hover:bg-green-100'
                                }`
                    }
            
            
            
                 >

                    {categoria.name}

                </button>


           ))}



        </div>

    );
};


export default FiltrosMenu;