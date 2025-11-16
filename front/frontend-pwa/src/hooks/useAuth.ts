// frontend-pwa/src/hooks/useAuth.ts
import { useState, useCallback } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AUTH_API_URL = 'http://127.0.0.1:8002/api/token/'; 

interface AuthTokens {
  access: string;
  refresh: string;
}

interface AuthTokens {access: string; refresh: string;}
interface TokenPayload {is_admin:boolean; is_cocinero: boolean; is_active: boolean;}




const useAuth = () => {
  // Inicializar tokens desde localStorage (para persistencia)
  const [tokens, setTokens] = useState<AuthTokens | null>(() => {
    const access = localStorage.getItem('accessToken');
    const refresh = localStorage.getItem('refreshToken');
    return access && refresh ? { access, refresh } : null;
  });

  const [userRole, setUserRole] = useState<'admin' | 'cocinero' | 'cliente' | null>(null);

  const isAuthenticated = !!tokens;

  const login = useCallback(async (username, password) => {
    
      const response = await axios.post(AUTH_API_URL, { username, password });
     if (response.status === 200) {
            const newTokens: AuthTokens = response.data;
            const payload: TokenPayload = jwtDecode(newTokens.access); // Decodificar el token
            
            // Determinar y guardar el rol
            let role: 'admin' | 'cocinero' | 'cliente';
            if (payload.is_admin) {
                role = 'admin';
            } else if (payload.is_cocinero) {
                role = 'cocinero';
            } else if (payload.is_active) {
                role = 'cliente';
            } else {
                // Cliente inactivo
                throw new Error("Cuenta inactiva. Por favor, contacta a soporte.");
            }
            
            localStorage.setItem('accessToken', newTokens.access);
            localStorage.setItem('refreshToken', newTokens.refresh);
            localStorage.setItem('userRole', role); // Guardar el rol
            setTokens(newTokens);
            setUserRole(role);
            
            return { success: true, role };
        }
        return { success: false, role: null };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setTokens(null);
  }, []);


  // Función para obtener el rol para la redirección
    const getUserRole = useCallback(() => {
        return userRole || localStorage.getItem('userRole');
    }, [userRole]);

  // Función para obtener headers con el token de acceso
  const getAuthHeaders = useCallback(() => {
    return tokens ? { Authorization: `Bearer ${tokens.access}` } : {};
  }, [tokens]);

  return { isAuthenticated, login, logout, getAuthHeaders, getUserRole };
};

export default useAuth;