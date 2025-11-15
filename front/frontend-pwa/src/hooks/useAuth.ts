// frontend-pwa/src/hooks/useAuth.ts
import { useState, useCallback } from 'react';
import axios from 'axios';

const AUTH_API_URL = 'http://127.0.0.1:8002/api/token/'; 

interface AuthTokens {
  access: string;
  refresh: string;
}

const useAuth = () => {
  // Inicializar tokens desde localStorage (para persistencia)
  const [tokens, setTokens] = useState<AuthTokens | null>(() => {
    const access = localStorage.getItem('accessToken');
    const refresh = localStorage.getItem('refreshToken');
    return access && refresh ? { access, refresh } : null;
  });

  const isAuthenticated = !!tokens;

  const login = useCallback(async (username, password) => {
    try {
      const response = await axios.post(AUTH_API_URL, { username, password });
      const newTokens: AuthTokens = response.data;
      
      localStorage.setItem('accessToken', newTokens.access);
      localStorage.setItem('refreshToken', newTokens.refresh);
      setTokens(newTokens);
      return true;
    } catch (error) {
      console.error("Fallo de inicio de sesión", error);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setTokens(null);
  }, []);

  // Función para obtener headers con el token de acceso
  const getAuthHeaders = useCallback(() => {
    return tokens ? { Authorization: `Bearer ${tokens.access}` } : {};
  }, [tokens]);

  return { isAuthenticated, login, logout, getAuthHeaders };
};

export default useAuth;