export type AppointmentStatus = 'BOOKED' | 'COMPLETED' | 'CANCELLED';
export type AiStatus = 'PENDING' | 'READY' | 'FAILED';

export interface PreVisitSummary {
  urgency: 'Low' | 'Medium' | 'High';
  chiefComplaint: string;
  suggestedQuestions: string[];
}

export interface AvailableSlot {
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  available: boolean;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  doctorId: string;
  doctorName: string;
  doctorEmail: string;
  date: string;              // YYYY-MM-DD
  appointmentDate?: string;  // YYYY-MM-DD
  startTime: string;         // HH:mm
  endTime: string;           // HH:mm
  status: AppointmentStatus;
  reason?: string;
  patientNotes?: string;
  symptoms?: string;
  preVisitSummary?: PreVisitSummary | null;
  postVisitSummary?: any;
  aiStatus?: AiStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentRequest {
  doctorId: string;
  date: string;
  appointmentDate?: string;
  startTime: string;
  reason?: string;
  patientNotes?: string;
  symptoms?: string;
}

export interface RescheduleAppointmentRequest {
  date: string;
  appointmentDate?: string;
  startTime: string;
}

