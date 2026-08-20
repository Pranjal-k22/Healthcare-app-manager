import React, { createContext, useState, useEffect, useCallback } from 'react';
import {
  AuthContextType,
  AuthState,
  LoginCredentials,
  RegisterData,
  User,
} from '../types/auth';
import { TOKEN_STORAGE_KEY } from '../utils/constants';
import { fetchCurrentUser, loginUser, registerUser } from '../services/authApi';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem(TOKEN_STORAGE_KEY),
    isAuthenticated: false,
    isLoading: true,
  });

  // Verify and hydrate current user on application load
  const loadUser = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) {
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
      return;
    }

    try {
      const response = await fetchCurrentUser();
      setState({
        user: response.user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.warn('[AuthContext] Session expired or invalid token:', error);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (credentials: LoginCredentials): Promise<User> => {
    const response = await loginUser(credentials);
    localStorage.setItem(TOKEN_STORAGE_KEY, response.token);
    setState({
      user: response.user,
      token: response.token,
      isAuthenticated: true,
      isLoading: false,
    });
    return response.user;
  };

  const register = async (data: RegisterData): Promise<User> => {
    const response = await registerUser(data);
    localStorage.setItem(TOKEN_STORAGE_KEY, response.token);
    setState({
      user: response.user,
      token: response.token,
      isAuthenticated: true,
      isLoading: false,
    });
    return response.user;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
