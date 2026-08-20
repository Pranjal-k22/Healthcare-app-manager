import apiClient from './apiClient';
import { NotificationItem, NotificationsMeta } from '../types/notification';

/**
 * Get user's notifications
 */
export const getNotifications = async (params: {
  isRead?: boolean | string;
  limit?: number;
  page?: number;
} = {}): Promise<{ notifications: NotificationItem[]; meta: NotificationsMeta }> => {
  const response = await apiClient.get<{
    success: boolean;
    data: NotificationItem[];
    meta: NotificationsMeta;
  }>('/notifications', { params });

  return {
    notifications: response.data.data,
    meta: response.data.meta,
  };
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async (): Promise<number> => {
  const response = await apiClient.get<{
    success: boolean;
    data: { unreadCount: number };
  }>('/notifications/unread-count');

  return response.data.data.unreadCount;
};

/**
 * Mark a single notification as read
 */
export const markNotificationAsRead = async (
  notificationId: string
): Promise<NotificationItem> => {
  const response = await apiClient.patch<{
    success: boolean;
    data: NotificationItem;
  }>(`/notifications/${notificationId}/read`);

  return response.data.data;
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (): Promise<number> => {
  const response = await apiClient.patch<{
    success: boolean;
    data: { updatedCount: number };
  }>('/notifications/read-all');

  return response.data.data.updatedCount;
};

/**
 * Delete a notification
 */
export const deleteNotification = async (notificationId: string): Promise<boolean> => {
  const response = await apiClient.delete<{ success: boolean }>(
    `/notifications/${notificationId}`
  );
  return response.data.success;
};
