import { useState, useEffect, useRef, useCallback } from 'react';

// URL Base del WebSocket (Ajusta el puerto si es necesario)
const WS_BASE_URL = 'ws://127.0.0.1:8001/ws/pedidos/';

interface PedidoUpdate {
    order_number: string;
    status: string;
    client_name: string;
}

export const useOrderWebSocket = (roomId: string) => {
    const [lastMessage, setLastMessage] = useState<PedidoUpdate | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<WebSocket | null>(null);

    const connect = useCallback(() => {
        // Evitar dobles conexiones
        if (socketRef.current?.readyState === WebSocket.OPEN) return;

        // Construir URL: si roomId es 'cocina', conecta al canal global. Si es UUID, al privado.
        const url = `${WS_BASE_URL}${roomId}/`;
        const socket = new WebSocket(url);
        socketRef.current = socket;

        socket.onopen = () => {
            console.log(` WS Conectado a sala: ${roomId}`);
            setIsConnected(true);
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'actualizacion_pedido' || data.tipo === 'pedido_update') {
                    setLastMessage(data.pedido);
                }
            } catch (err) {
                console.error("Error parseando mensaje WS:", err);
            }
        };

        socket.onclose = () => {
            console.log(` WS Desconectado de sala: ${roomId}`);
            setIsConnected(false);
            setTimeout(() => connect(), 3000); 
        };

        socket.onerror = (error) => {
            console.error(" Error en WebSocket:", error);
            socket.close();
        };

    }, [roomId]);

    useEffect(() => {
        connect();

        return () => {
            // Limpieza al desmontar el componente
            if (socketRef.current) {
                socketRef.current.close();
            }
        };
    }, [connect]);

    return { lastMessage, isConnected };
};