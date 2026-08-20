import apiClient from './apiClient';
import {
  AddLeaveRequest,
  CreateDoctorRequest,
  Doctor,
  DoctorsApiResponse,
  Leave,
  LeavesApiResponse,
  SingleDoctorApiResponse,
  UpdateDoctorRequest,
} from '../types/doctor';

/**
 * Fetch list of doctors with optional search or specialization filter
 */
export const getDoctors = async (params?: {
  specialization?: string;
  search?: string;
}): Promise<Doctor[]> => {
  const response = await apiClient.get<DoctorsApiResponse>('/doctors', {
    params,
  });
  return response.data.data;
};

/**
 * Fetch a single doctor by ID
 */
export const getDoctorById = async (id: string): Promise<Doctor> => {
  const response = await apiClient.get<SingleDoctorApiResponse>(`/doctors/${id}`);
  return response.data.data;
};

/**
 * Fetch current authenticated doctor's profile
 */
export const getMyDoctorProfile = async (): Promise<Doctor> => {
  const response = await apiClient.get<SingleDoctorApiResponse>('/doctors/me');
  return response.data.data;
};

/**
 * Admin: Create a new doctor account and linked profile
 */
export const createDoctor = async (
  data: CreateDoctorRequest
): Promise<Doctor> => {
  const response = await apiClient.post<SingleDoctorApiResponse>(
    '/doctors',
    data
  );
  return response.data.data;
};

/**
 * Admin: Update doctor profile information
 */
export const updateDoctor = async (
  id: string,
  data: UpdateDoctorRequest
): Promise<Doctor> => {
  const response = await apiClient.put<SingleDoctorApiResponse>(
    `/doctors/${id}`,
    data
  );
  return response.data.data;
};

/**
 * Admin: Add a scheduled leave date for a doctor
 */
export const addDoctorLeave = async (
  id: string,
  data: AddLeaveRequest
): Promise<Leave[]> => {
  const response = await apiClient.post<LeavesApiResponse>(
    `/doctors/${id}/leave`,
    data
  );
  return response.data.data;
};

/**
 * Fetch all leaves for a doctor
 */
export const getDoctorLeaves = async (id: string): Promise<Leave[]> => {
  const response = await apiClient.get<LeavesApiResponse>(`/doctors/${id}/leaves`);
  return response.data.data;
};

/**
 * Admin: Remove a scheduled leave date for a doctor
 */
export const removeDoctorLeave = async (
  id: string,
  date: string
): Promise<Leave[]> => {
  const response = await apiClient.delete<LeavesApiResponse>(
    `/doctors/${id}/leave/${date}`
  );
  return response.data.data;
};
