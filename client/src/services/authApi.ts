import apiClient from './apiClient';
import {
  AuthResponse,
  ForgotPasswordData,
  LoginCredentials,
  MeResponse,
  RegisterData,
  ResetPasswordData,
  SetPasswordData,
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
 * Request password reset email
 */
export const forgotPasswordUser = async (
  data: ForgotPasswordData
): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.post<{ success: boolean; message: string }>(
    '/auth/forgot-password',
    data
  );
  return response.data;
};

/**
 * Reset password using token
 */
export const resetPasswordUser = async (
  data: ResetPasswordData
): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.post<{ success: boolean; message: string }>(
    '/auth/reset-password',
    data
  );
  return response.data;
};

/**
 * First-time Doctor Account Activation / Set Password
 */
export const setPasswordUser = async (
  data: SetPasswordData
): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.post<{ success: boolean; message: string }>(
    '/auth/set-password',
    data
  );
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
