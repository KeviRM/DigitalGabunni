// frontend-pwa/src/context/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';

import { authApi } from '../api/axiosConfig';

// URLs de Autenticación
const AUTH_API_URL = '/api/token/';
const GOOGLE_AUTH_API_URL = '/api/google-login/';

// Tipos
interface AuthTokens {
    access: string;
    refresh: string;
}

interface TokenPayload {
    is_admin: boolean;
    is_cocinero: boolean;
    is_cajero: boolean;
    is_active: boolean;
    user_id?: number;
}

type UserRole = 'admin' | 'cocinero' | 'cliente' | 'cajero' | null;

interface AuthContextType {
    isAuthenticated: boolean;
    userRole: UserRole;
    login: (username: string, pass: string) => Promise<{ success: boolean; role: UserRole }>;
    loginWithGoogle: (token: string) => Promise<{ success: boolean; role: UserRole }>;
    logout: () => void;
    getAuthHeaders: () => { Authorization?: string };
    getUserRole: () => UserRole;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Estado Global de Autenticación
    const [tokens, setTokens] = useState<AuthTokens | null>(() => {
        const access = localStorage.getItem('accessToken');
        const refresh = localStorage.getItem('refreshToken');
        return access && refresh ? { access, refresh } : null;
    });

    const [userRole, setUserRole] = useState<UserRole>(() => {
        return (localStorage.getItem('userRole') as UserRole) || null;
    });

    const isAuthenticated = !!tokens;

    // Función auxiliar para procesar el token y guardar estado
    const handleTokenResponse = (data: any): { success: boolean; role: UserRole } => {
        try {
            const newTokens: AuthTokens = { access: data.access, refresh: data.refresh };
            const payload: TokenPayload = jwtDecode(newTokens.access);

            let role: UserRole = 'cliente';
            if (payload.is_admin) role = 'admin';
            else if (payload.is_cocinero) role = 'cocinero';
            else if (payload.is_cajero) role = 'cajero';
            else if (!payload.is_active) throw new Error("Cuenta inactiva");

            // Guardar en localStorage
            localStorage.setItem('accessToken', newTokens.access);
            localStorage.setItem('refreshToken', newTokens.refresh);
            localStorage.setItem('userRole', role || '');

            // Actualizar ESTADO (Esto disparará el re-render del Navbar)
            setTokens(newTokens);
            setUserRole(role);

            return { success: true, role };
        } catch (e) {
            console.error("Error procesando token", e);
            return { success: false, role: null };
        }
    };

    const login = async (username: string, pass: string) => {
        try {
            const response = await authApi.post(AUTH_API_URL, { username, password: pass });
            return handleTokenResponse(response.data);
        } catch (error) {
            console.error("Login fallido", error);
            return { success: false, role: null };
        }
    };

    const loginWithGoogle = async (accessToken: string) => {
        try {
            const response = await authApi.post(GOOGLE_AUTH_API_URL, { access_token: accessToken });
            return handleTokenResponse(response.data);
        } catch (error) {
            console.error(error);

            return { success: false, role: null };
        }
    };

    const logout = useCallback(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userRole');
        setTokens(null);
        setUserRole(null);
        // Opcional: Redirigir al home o login
        window.location.href = '/'; 
    }, []);

    const getAuthHeaders = useCallback(() => {
        return tokens ? { Authorization: `Bearer ${tokens.access}` } : {};
    }, [tokens]);

    const getUserRole = useCallback(() => userRole, [userRole]);

    const value = {
        isAuthenticated,
        userRole,
        login,
        loginWithGoogle,
        logout,
        getAuthHeaders,
        getUserRole
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};