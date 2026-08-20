import apiClient from './apiClient';
import {
  Appointment,
  AppointmentStatus,
  AvailableSlot,
  CreateAppointmentRequest,
  RescheduleAppointmentRequest,
} from '../types/appointment';

/**
 * Get generated available slots for a doctor on a specific date
 */
export const getAvailableSlots = async (
  doctorId: string,
  date: string
): Promise<AvailableSlot[]> => {
  const response = await apiClient.get<{ success: boolean; data: AvailableSlot[] }>(
    `/appointments/slots/${doctorId}/${date}`
  );
  return response.data.data;
};

/**
 * Book a new appointment
 */
export const bookAppointment = async (
  payload: CreateAppointmentRequest
): Promise<Appointment> => {
  const response = await apiClient.post<{ success: boolean; data: Appointment }>(
    '/appointments',
    payload
  );
  return response.data.data;
};

/**
 * Get all appointments for the logged-in patient
 */
export const getMyAppointments = async (
  status?: AppointmentStatus
): Promise<Appointment[]> => {
  const params = status ? { status } : {};
  const response = await apiClient.get<{ success: boolean; data: Appointment[] }>(
    '/appointments/my',
    { params }
  );
  return response.data.data;
};

/**
 * Get all appointments for the logged-in doctor
 */
export const getDoctorAppointments = async (
  status?: AppointmentStatus,
  date?: string
): Promise<Appointment[]> => {
  const params: Record<string, string> = {};
  if (status) params.status = status;
  if (date) params.date = date;

  const response = await apiClient.get<{ success: boolean; data: Appointment[] }>(
    '/appointments/doctor',
    { params }
  );
  return response.data.data;
};

/**
 * Get single appointment by ID
 */
export const getAppointmentById = async (id: string): Promise<Appointment> => {
  const response = await apiClient.get<{ success: boolean; data: Appointment }>(
    `/appointments/${id}`
  );
  return response.data.data;
};

/**
 * Cancel an appointment
 */
export const cancelAppointment = async (id: string): Promise<Appointment> => {
  const response = await apiClient.patch<{ success: boolean; data: Appointment }>(
    `/appointments/${id}/cancel`
  );
  return response.data.data;
};

/**
 * Reschedule an appointment atomically
 */
export const rescheduleAppointment = async (
  id: string,
  payload: RescheduleAppointmentRequest
): Promise<Appointment> => {
  const response = await apiClient.patch<{ success: boolean; data: Appointment }>(
    `/appointments/${id}/reschedule`,
    payload
  );
  return response.data.data;
};

/**
 * Mark appointment as COMPLETED (Doctor or Admin)
 */
export const completeAppointment = async (id: string): Promise<Appointment> => {
  const response = await apiClient.patch<{ success: boolean; data: Appointment }>(
    `/appointments/${id}/complete`
  );
  return response.data.data;
};

/**
 * Admin: Get all appointments
 */
export const getAllAppointmentsForAdmin = async (filters?: {
  doctorId?: string;
  patientId?: string;
  status?: AppointmentStatus;
  date?: string;
}): Promise<Appointment[]> => {
  const response = await apiClient.get<{ success: boolean; data: Appointment[] }>(
    '/appointments/admin/all',
    { params: filters }
  );
  return response.data.data;
};
