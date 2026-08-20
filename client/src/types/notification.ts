export type NotificationType =
  | 'APPOINTMENT_BOOKED'
  | 'APPOINTMENT_CONFIRMED'
  | 'APPOINTMENT_CANCELLED'
  | 'APPOINTMENT_RESCHEDULED'
  | 'APPOINTMENT_REMINDER'
  | 'PRESCRIPTION_AVAILABLE'
  | 'MEDICATION_REMINDER';

export interface NotificationItem {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedAppointmentId?: string | {
    _id?: string;
    id?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    status?: string;
    reason?: string;
  } | null;
  isRead: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsMeta {
  total: number;
  page: number;
  limit: number;
}
