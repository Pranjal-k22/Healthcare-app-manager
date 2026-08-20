import apiClient from './apiClient';
import { CalendarConnectionStatus } from '../types/calendar';

/**
 * Fetch Google OAuth authorization URL
 */
export const getGoogleAuthUrl = async (): Promise<string> => {
  const response = await apiClient.get<{
    success: boolean;
    data: { authUrl: string };
  }>('/calendar/oauth/url');

  return response.data.data.authUrl;
};

/**
 * Get current user's Google Calendar connection status
 */
export const getCalendarConnectionStatus = async (): Promise<CalendarConnectionStatus> => {
  const response = await apiClient.get<{
    success: boolean;
    data: CalendarConnectionStatus;
  }>('/calendar/status');

  return response.data.data;
};

/**
 * Disconnect Google Calendar account
 */
export const disconnectGoogleCalendar = async (): Promise<boolean> => {
  const response = await apiClient.post<{ success: boolean }>('/calendar/disconnect');
  return response.data.success;
};

/**
 * Manually synchronize an appointment to Google Calendar
 */
export const manualSyncAppointment = async (appointmentId: string): Promise<boolean> => {
  const response = await apiClient.post<{
    success: boolean;
    data: { synced: boolean };
  }>(`/calendar/sync/${appointmentId}`);

  return response.data.data.synced;
};
