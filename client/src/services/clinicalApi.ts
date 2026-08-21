import apiClient from './apiClient';
import {
  ClinicalRecord,
  Prescription,
  SaveClinicalRecordRequest,
  SavePrescriptionRequest,
  CompleteConsultationRequest,
} from '../types/clinical';
import { Appointment } from '../types/appointment';

/**
 * Save or update clinical notes for an appointment
 */
export const saveClinicalRecord = async (
  appointmentId: string,
  data: SaveClinicalRecordRequest
): Promise<ClinicalRecord> => {
  const response = await apiClient.post<{ success: boolean; data: ClinicalRecord }>(
    `/appointments/${appointmentId}/clinical-record`,
    data
  );
  return response.data.data;
};

/**
 * Get clinical record for an appointment
 */
export const getClinicalRecord = async (
  appointmentId: string
): Promise<ClinicalRecord | null> => {
  const response = await apiClient.get<{ success: boolean; data: ClinicalRecord | null }>(
    `/appointments/${appointmentId}/clinical-record`
  );
  return response.data.data;
};

/**
 * Save or update structured prescription
 */
export const savePrescription = async (
  appointmentId: string,
  data: SavePrescriptionRequest
): Promise<Prescription> => {
  const response = await apiClient.post<{ success: boolean; data: Prescription }>(
    `/appointments/${appointmentId}/prescription`,
    data
  );
  return response.data.data;
};

/**
 * Get prescription for an appointment
 */
export const getPrescription = async (
  appointmentId: string
): Promise<Prescription | null> => {
  const response = await apiClient.get<{ success: boolean; data: Prescription | null }>(
    `/appointments/${appointmentId}/prescription`
  );
  return response.data.data;
};

/**
 * Get list of all prescriptions for current logged-in patient
 */
export const getMyPrescriptions = async (): Promise<Prescription[]> => {
  const response = await apiClient.get<{ success: boolean; data: Prescription[] }>(
    '/prescriptions/my'
  );
  return response.data.data;
};

/**
 * Complete consultation with clinical records & prescription
 */
export const completeConsultationWorkflow = async (
  appointmentId: string,
  data: CompleteConsultationRequest
): Promise<{ appointment: Appointment; clinicalRecord: ClinicalRecord; prescription: Prescription }> => {
  const response = await apiClient.post<{
    success: boolean;
    data: { appointment: Appointment; clinicalRecord: ClinicalRecord; prescription: Prescription };
  }>(`/appointments/${appointmentId}/complete-consultation`, data);
  return response.data.data;
};

/**
 * Generate Post-Visit AI Summary on Demand using Google Gemini
 */
export const generatePostVisitSummary = async (
  appointmentId: string,
  data: { clinicalNotes: string; medicines?: any[] }
): Promise<{ postVisitSummary: any; aiStatus: string; promptVersion: string }> => {
  const response = await apiClient.post<{
    success: boolean;
    data: { postVisitSummary: any; aiStatus: string; promptVersion: string };
  }>(`/appointments/${appointmentId}/generate-post-visit`, data);
  return response.data.data;
};

