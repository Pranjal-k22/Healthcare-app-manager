import apiClient from './apiClient';
import { MedicationReminderItem } from '../types/medicationReminder';

/**
 * Get patient's medication reminders for today
 */
export const getTodayReminders = async (date?: string): Promise<MedicationReminderItem[]> => {
  const response = await apiClient.get<{
    success: boolean;
    data: MedicationReminderItem[];
  }>('/medication-reminders/today', { params: { date } });

  return response.data.data;
};

/**
 * Get patient's upcoming scheduled medication doses
 */
export const getUpcomingReminders = async (): Promise<MedicationReminderItem[]> => {
  const response = await apiClient.get<{
    success: boolean;
    data: MedicationReminderItem[];
  }>('/medication-reminders/upcoming');

  return response.data.data;
};

/**
 * Get patient's complete reminder history
 */
export const getReminderHistory = async (): Promise<MedicationReminderItem[]> => {
  const response = await apiClient.get<{
    success: boolean;
    data: MedicationReminderItem[];
  }>('/medication-reminders/history');

  return response.data.data;
};

/**
 * Mark a medication reminder as taken
 */
export const markReminderTaken = async (
  reminderId: string
): Promise<MedicationReminderItem> => {
  const response = await apiClient.patch<{
    success: boolean;
    data: MedicationReminderItem;
  }>(`/medication-reminders/${reminderId}/taken`);

  return response.data.data;
};

/**
 * Mark a medication reminder as skipped / missed
 */
export const markReminderSkipped = async (
  reminderId: string
): Promise<MedicationReminderItem> => {
  const response = await apiClient.patch<{
    success: boolean;
    data: MedicationReminderItem;
  }>(`/medication-reminders/${reminderId}/skip`);

  return response.data.data;
};

/**
 * Get all reminders for a specific prescription
 */
export const getPrescriptionReminders = async (
  prescriptionId: string
): Promise<MedicationReminderItem[]> => {
  const response = await apiClient.get<{
    success: boolean;
    data: MedicationReminderItem[];
  }>(`/prescriptions/${prescriptionId}/reminders`);

  return response.data.data;
};
