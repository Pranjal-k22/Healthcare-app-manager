import apiClient from './apiClient';
import {
  Doctor,
  CreateDoctorRequest,
  UpdateDoctorRequest,
  Leave,
  LeaveRequest,
} from '../types/doctor';

/**
 * Fetch list of doctors with optional search and filters
 */
export const getDoctors = async (params?: {
  search?: string;
  specialization?: string;
  isAvailable?: boolean;
  includeInactive?: boolean;
}): Promise<Doctor[]> => {
  const response = await apiClient.get<{ success: boolean; data: Doctor[] }>(
    '/doctors',
    { params }
  );
  return response.data.data;
};

/**
 * Fetch a single doctor profile by ID
 */
export const getDoctorById = async (id: string): Promise<Doctor> => {
  const response = await apiClient.get<{ success: boolean; data: Doctor }>(
    `/doctors/${id}`
  );
  return response.data.data;
};

/**
 * Fetch the logged-in doctor's own profile
 */
export const getMyDoctorProfile = async (): Promise<Doctor> => {
  const response = await apiClient.get<{ success: boolean; data: Doctor }>(
    '/doctors/me'
  );
  return response.data.data;
};

/**
 * Update the logged-in doctor's own profile (Doctor self-service)
 */
export const updateMyDoctorProfile = async (
  data: UpdateDoctorRequest
): Promise<Doctor> => {
  const response = await apiClient.put<{ success: boolean; data: Doctor }>(
    '/doctors/me',
    data
  );
  return response.data.data;
};

/**
 * Create a new doctor profile (Admin only)
 */
export const createDoctor = async (
  data: CreateDoctorRequest
): Promise<Doctor> => {
  const response = await apiClient.post<{ success: boolean; data: Doctor }>(
    '/doctors',
    data
  );
  return response.data.data;
};

/**
 * Update a doctor profile by ID (Admin only)
 */
export const updateDoctor = async (
  id: string,
  data: UpdateDoctorRequest
): Promise<Doctor> => {
  const response = await apiClient.put<{ success: boolean; data: Doctor }>(
    `/doctors/${id}`,
    data
  );
  return response.data.data;
};

/**
 * Toggle doctor active / deactivated status (Admin only)
 */
export const toggleDoctorActiveStatus = async (
  id: string,
  isActive: boolean
): Promise<Doctor> => {
  const response = await apiClient.patch<{ success: boolean; data: Doctor }>(
    `/doctors/${id}/status`,
    { isActive }
  );
  return response.data.data;
};

export interface AddDoctorLeaveResponse {
  success: boolean;
  message: string;
  data: Leave[];
  leave?: Leave;
  cancelledAppointmentsCount?: number;
  affectedPatientIds?: string[];
}

/**
 * Schedule a leave date for a doctor
 */
export const addDoctorLeave = async (
  id: string,
  data: LeaveRequest
): Promise<AddDoctorLeaveResponse> => {
  const response = await apiClient.post<AddDoctorLeaveResponse>(
    `/doctors/${id}/leave`,
    data
  );
  return response.data;
};

/**
 * Remove a scheduled leave date for a doctor
 */
export const removeDoctorLeave = async (
  id: string,
  date: string
): Promise<Leave[]> => {
  const response = await apiClient.delete<{ success: boolean; data: Leave[] }>(
    `/doctors/${id}/leave/${date}`
  );
  return response.data.data;
};

/**
 * Get leaves for a doctor
 */
export const getDoctorLeaves = async (id: string): Promise<Leave[]> => {
  const response = await apiClient.get<{ success: boolean; data: Leave[] }>(
    `/doctors/${id}/leaves`
  );
  return response.data.data;
};
