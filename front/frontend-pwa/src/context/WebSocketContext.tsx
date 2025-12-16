import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';

import { WS_BASE_URL } from '../api/axiosConfig';

// Conectamos a la sala 'cocina' que es donde el backend envía los eventos
const WS_URL = `${WS_BASE_URL}/ws/pedidos/cocina/`;

type WebSocketStatus = 'CONNECTING' | 'OPEN' | 'CLOSED';

interface WebSocketContextType {
    status: WebSocketStatus;
    lastMessage: any;
    sendMessage: (message: any) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context;
};

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, getAuthHeaders } = useAuth();
    const [status, setStatus] = useState<WebSocketStatus>('CLOSED');
    const [lastMessage, setLastMessage] = useState<any>(null);
    const ws = useRef<WebSocket | null>(null);
    const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

    const connect = useCallback(() => {
        if (!isAuthenticated) return;

        const headers = getAuthHeaders();
        const token = headers.Authorization?.split(' ')[1];

        if (!token) return;

        // Close existing connection if any
        if (ws.current) {
            ws.current.close();
        }

        const socket = new WebSocket(`${WS_URL}?token=${token}`);
        setStatus('CONNECTING');

        socket.onopen = () => {
            setStatus('OPEN');
            // Clear any pending reconnect timeout
            if (reconnectTimeout.current) {
                clearTimeout(reconnectTimeout.current);
                reconnectTimeout.current = null;
            }
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                setLastMessage(data);
            } catch (e) {
                // Error silencioso
            }
        };

        socket.onclose = () => {
            setStatus('CLOSED');
            ws.current = null;

            // Attempt to reconnect after 3 seconds
            if (isAuthenticated) {
                reconnectTimeout.current = setTimeout(() => {
                    connect();
                }, 3000);
            }
        };

        socket.onerror = (error) => {
            console.error('WebSocket Error:', error);
            socket.close();
        };

        ws.current = socket;
    }, [isAuthenticated, getAuthHeaders]);

    useEffect(() => {
        if (isAuthenticated) {
            connect();
        } else {
            if (ws.current) {
                ws.current.close();
            }
        }

        return () => {
            if (ws.current) {
                ws.current.close();
            }
            if (reconnectTimeout.current) {
                clearTimeout(reconnectTimeout.current);
            }
        };
    }, [isAuthenticated, connect]);

    const sendMessage = useCallback((message: any) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify(message));
        } else {
            console.warn('WebSocket is not open. Cannot send message.');
        }
    }, []);

    return (
        <WebSocketContext.Provider value={{ status, lastMessage, sendMessage }}>
            {children}
        </WebSocketContext.Provider>
    );
};
