import React, { createContext, useState, useEffect, useCallback } from 'react';
import {
  AuthContextType,
  AuthState,
  ForgotPasswordData,
  LoginCredentials,
  RegisterData,
  ResetPasswordData,
  SetPasswordData,
  User,
} from '../types/auth';
import { TOKEN_STORAGE_KEY } from '../utils/constants';
import {
  fetchCurrentUser,
  forgotPasswordUser,
  loginUser,
  registerUser,
  resetPasswordUser,
  setPasswordUser,
  verifyOtpUser,
} from '../services/authApi';

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

  // Verify and hydrate current user on application load via GET /api/auth/me
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

  const forgotPassword = async (data: ForgotPasswordData) => {
    return await forgotPasswordUser(data);
  };

  const verifyOtp = async (payload: any) => {
    return await verifyOtpUser(payload);
  };

  const resetPassword = async (data: ResetPasswordData) => {
    return await resetPasswordUser(data);
  };

  const setPassword = async (data: SetPasswordData) => {
    return await setPasswordUser(data);
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
        forgotPassword,
        verifyOtp,
        resetPassword,
        setPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
