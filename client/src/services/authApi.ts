import apiClient from './apiClient';
import {
  AuthResponse,
  LoginCredentials,
  MeResponse,
  RegisterData,
} from '../types/auth';

/**
 * Register a new patient account
 */
export const registerUser = async (
  data: RegisterData
): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/register', data);
  return response.data;
};

/**
 * Log in an existing user
 */
export const loginUser = async (
  credentials: LoginCredentials
): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
  return response.data;
};

/**
 * Fetch authenticated user details with token
 */
export const fetchCurrentUser = async (): Promise<MeResponse> => {
  const response = await apiClient.get<MeResponse>('/auth/me');
  return response.data;
};

/**
 * Change password for authenticated user
 */
export const changePasswordApi = async (
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.post<{ success: boolean; message: string }>(
    '/auth/change-password',
    { currentPassword, newPassword }
  );
  return response.data;
};
