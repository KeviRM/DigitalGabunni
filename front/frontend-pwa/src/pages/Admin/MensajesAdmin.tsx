import React, { useState, useEffect } from 'react';
import { getContactMessages, markMessageAsRead, type MensajeContacto } from '../../services/contenidoService';

const MensajesAdmin: React.FC = () => {
    const [mensajes, setMensajes] = useState<MensajeContacto[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState<MensajeContacto | null>(null);

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        setLoading(true);
        const data = await getContactMessages();
        setMensajes(data);
        setLoading(false);
    };

    const handleOpenModal = (msg: MensajeContacto) => {
        setSelectedMessage(msg);
    };

    const handleCloseModal = () => {
        setSelectedMessage(null);
    };

    const handleMarkAsRead = async (id: number, currentStatus: boolean) => {
        try {
            const updatedMsg = await markMessageAsRead(id, !currentStatus);
            setMensajes(mensajes.map(m => m.id === id ? updatedMsg : m));
            if (selectedMessage && selectedMessage.id === id) {
                setSelectedMessage(updatedMsg);
            }
        } catch (error) {
            console.error("Failed to update message status", error);
        }
    };

    if (loading) return <div className="p-8">Cargando mensajes...</div>;

    return (
        <div className="p-8 w-full relative">
            <h1 className="text-3xl font-bold mb-6">Mensajes de Contacto</h1>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul role="list" className="divide-y divide-gray-200">
                    {mensajes.length === 0 ? (
                        <li className="px-4 py-4 text-center text-gray-500">No hay mensajes.</li>
                    ) : (
                        mensajes.map((msg) => (
                            <li key={msg.id} className={`block hover:bg-gray-50 ${!msg.leido ? 'bg-orange-50' : ''}`}>
                                <div className="px-4 py-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <p className={`text-sm font-medium truncate ${!msg.leido ? 'text-orange-600 font-bold' : 'text-gray-600'}`}>
                                            {msg.nombre} {msg.numero ? `(${msg.numero})` : ''}
                                        </p>
                                        <div className="ml-2 flex-shrink-0 flex items-center gap-2">
                                            <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                                {new Date(msg.fecha_creacion || '').toLocaleDateString()}
                                            </p>
                                            <button
                                                onClick={() => handleOpenModal(msg)}
                                                className="text-xs text-blue-600 hover:text-blue-800 underline"
                                            >
                                                Ver mensaje
                                            </button>
                                        </div>
                                    </div>
                                    <div className="mt-2 sm:flex sm:justify-between">
                                        <div className="sm:flex">
                                            <p className="flex items-center text-sm text-gray-500">
                                                {msg.email}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-2 text-sm text-gray-700 line-clamp-2">
                                        {msg.mensaje.length > 100 ? `${msg.mensaje.substring(0, 100)}...` : msg.mensaje}
                                    </div>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>

            {/* Modal */}
            {selectedMessage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 relative">
                        <button
                            onClick={handleCloseModal}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
                        >
                            &times;
                        </button>

                        <h2 className="text-2xl font-bold mb-4 border-b pb-2">Detalle del Mensaje</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <p className="text-sm text-gray-500">Nombre</p>
                                <p className="font-semibold">{selectedMessage.nombre}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Número</p>
                                <p className="font-semibold">{selectedMessage.numero || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="font-semibold">{selectedMessage.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Fecha</p>
                                <p className="font-semibold">{new Date(selectedMessage.fecha_creacion || '').toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <p className="text-sm text-gray-500 mb-2">Mensaje</p>
                            <div className="bg-gray-50 p-4 rounded border border-gray-200 text-gray-800 whitespace-pre-wrap max-h-60 overflow-y-auto">
                                {selectedMessage.mensaje}
                            </div>
                        </div>

                        <div className="flex justify-end items-center gap-4 border-t pt-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedMessage.leido}
                                    onChange={() => handleMarkAsRead(selectedMessage.id!, selectedMessage.leido!)}
                                    className="form-checkbox h-5 w-5 text-orange-600 rounded focus:ring-orange-500"
                                />
                                <span className="text-sm font-medium text-gray-700">Marcar como leído</span>
                            </label>
                            <button
                                onClick={handleCloseModal}
                                className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition-colors"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MensajesAdmin;
