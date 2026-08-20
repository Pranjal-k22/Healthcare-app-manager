export type MedicationReminderStatus =
  | 'PENDING'
  | 'SENT'
  | 'TAKEN'
  | 'MISSED'
  | 'CANCELLED';

export interface MedicationReminderItem {
  id: string;
  patientId: string;
  doctorId: { _id: string; name: string; email: string } | string;
  prescriptionId: string;
  appointmentId: string;
  medicineName: string;
  dosage: string;
  instructions: string;
  scheduledDate: string;
  scheduledTime: string;
  scheduledDateTime: string;
  status: MedicationReminderStatus;
  takenAt?: string;
  notificationSentAt?: string;
  createdAt: string;
  updatedAt: string;
}
