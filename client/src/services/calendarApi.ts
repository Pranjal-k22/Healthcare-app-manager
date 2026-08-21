import apiClient from './apiClient';
import { CalendarConnectionStatus } from '../types/calendar';

/**
 * Fetch Google OAuth authorization URL with signed state parameter
 */
export const getGoogleAuthUrl = async (): Promise<string> => {
  try {
    const response = await apiClient.get<{
      success: boolean;
      url?: string;
      authUrl?: string;
      data?: { url?: string; authUrl?: string };
    }>('/auth/google/connect');

    return (
      response.data.url ||
      response.data.authUrl ||
      response.data.data?.url ||
      response.data.data?.authUrl ||
      ''
    );
  } catch (err) {
    // Fallback to /calendar/oauth/url
    const response = await apiClient.get<{
      success: boolean;
      data: { authUrl: string };
    }>('/calendar/oauth/url');
    return response.data.data.authUrl;
  }
};

/**
 * Get current user's Google Calendar connection status
 */
export const getCalendarConnectionStatus = async (): Promise<CalendarConnectionStatus> => {
  try {
    const response = await apiClient.get<{
      success: boolean;
      connected?: boolean;
      isConnected?: boolean;
      googleAccountEmail?: string;
      connectedAt?: string;
      calendarId?: string;
      data?: CalendarConnectionStatus;
    }>('/patient/google-calendar/status');

    if (response.data.data) {
      return response.data.data;
    }

    return {
      isConnected: Boolean(response.data.connected ?? response.data.isConnected),
      googleAccountEmail: response.data.googleAccountEmail || '',
      updatedAt: response.data.connectedAt,
    };
  } catch (err) {
    const response = await apiClient.get<{
      success: boolean;
      data: CalendarConnectionStatus;
    }>('/calendar/status');
    return response.data.data;
  }
};

/**
 * Disconnect Google Calendar account
 */
export const disconnectGoogleCalendar = async (): Promise<boolean> => {
  try {
    const response = await apiClient.post<{ success: boolean }>(
      '/patient/google-calendar/disconnect'
    );
    return response.data.success;
  } catch (err) {
    const response = await apiClient.post<{ success: boolean }>('/calendar/disconnect');
    return response.data.success;
  }
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
