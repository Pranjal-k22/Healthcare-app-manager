import apiClient from './apiClient';
import { MedicineItem } from '../types/clinical';

export interface DetailedPrescription {
  _id: string;
  appointmentId: any;
  patientId: any;
  doctorId: any;
  status: 'active' | 'completed' | 'expired';
  durationDays?: number;
  medicines: MedicineItem[];
  additionalInstructions?: string;
  doctorProfile?: {
    specialization?: string;
    qualifications?: string[];
    experienceYears?: number;
    clinicName?: string;
  } | null;
  clinicalRecord?: {
    diagnosisNotes?: string;
    patientInstructions?: string;
    postVisitSummary?: string;
  } | null;
  createdAt: string;
}

/**
 * Get patient prescriptions list
 */
export const getPatientPrescriptions = async (params?: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ prescriptions: DetailedPrescription[]; meta: any }> => {
  const response = await apiClient.get<{
    success: boolean;
    data: DetailedPrescription[];
    meta: any;
  }>('/patient/prescriptions', { params });
  return {
    prescriptions: response.data.data,
    meta: response.data.meta,
  };
};

/**
 * Get single prescription detail
 */
export const getPatientPrescriptionById = async (
  id: string
): Promise<DetailedPrescription> => {
  const response = await apiClient.get<{
    success: boolean;
    data: DetailedPrescription;
  }>(`/patient/prescriptions/${id}`);
  return response.data.data;
};
