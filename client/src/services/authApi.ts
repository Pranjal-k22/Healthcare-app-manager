import apiClient from './apiClient';
import {
  AuthResponse,
  DoctorResetRequestItem,
  ForgotPasswordData,
  LoginCredentials,
  MeResponse,
  RegisterData,
  ResetPasswordData,
  SetPasswordData,
  VerifyDoctorOtpPayload,
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
 * Request password reset (Role-Branching Hybrid Workflow)
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
 * Verify Doctor 6-digit OTP and reset password
 */
export const verifyDoctorOtpUser = async (
  payload: VerifyDoctorOtpPayload
): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.post<{ success: boolean; message: string }>(
    '/auth/doctor/verify-otp',
    payload
  );
  return response.data;
};

/**
 * Fetch Admin Doctor Reset Requests Queue
 */
export const fetchAdminDoctorResetRequests = async (
  status = 'PENDING'
): Promise<{ success: boolean; data: DoctorResetRequestItem[] }> => {
  const response = await apiClient.get<{ success: boolean; data: DoctorResetRequestItem[] }>(
    `/admin/doctor-reset-requests?status=${status}`
  );
  return response.data;
};

/**
 * Approve Doctor Password Reset Request (Admin)
 */
export const approveAdminDoctorResetRequest = async (
  requestId: string
): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.post<{ success: boolean; message: string }>(
    `/admin/doctor-reset-requests/${requestId}/approve`
  );
  return response.data;
};

/**
 * Deny Doctor Password Reset Request (Admin)
 */
export const denyAdminDoctorResetRequest = async (
  requestId: string
): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.post<{ success: boolean; message: string }>(
    `/admin/doctor-reset-requests/${requestId}/deny`
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
