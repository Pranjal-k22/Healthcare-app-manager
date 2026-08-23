import apiClient from './apiClient';
import {
  AuthResponse,
  ForgotPasswordData,
  LoginCredentials,
  MeResponse,
  PasswordResetRequestItem,
  RegisterData,
  ResetPasswordData,
  SetPasswordData,
  VerifyOtpPayload,
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
 * Request password reset (Admin Approval Queue)
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
 * Verify 6-digit OTP and reset password
 */
export const verifyOtpUser = async (
  payload: VerifyOtpPayload
): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.post<{ success: boolean; message: string }>(
    '/auth/verify-otp',
    payload
  );
  return response.data;
};

/**
 * Fetch Admin Password Reset Requests Queue
 */
export const fetchAdminPasswordRequests = async (
  status = 'PENDING'
): Promise<{ success: boolean; data: PasswordResetRequestItem[] }> => {
  const response = await apiClient.get<{ success: boolean; data: PasswordResetRequestItem[] }>(
    `/admin/password-requests?status=${status}`
  );
  return response.data;
};

/**
 * Approve Password Reset Request (Admin)
 */
export const approveAdminPasswordRequest = async (
  requestId: string
): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.post<{ success: boolean; message: string }>(
    `/admin/password-requests/${requestId}/approve`
  );
  return response.data;
};

/**
 * Deny Password Reset Request (Admin)
 */
export const denyAdminPasswordRequest = async (
  requestId: string,
  reason?: string
): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.post<{ success: boolean; message: string }>(
    `/admin/password-requests/${requestId}/deny`,
    { reason }
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
