export type AppointmentStatus = 'BOOKED' | 'COMPLETED' | 'CANCELLED';
export type AiStatus = 'PENDING' | 'READY' | 'FAILED';

export interface DualEngineResult<T> {
  status: 'READY' | 'FAILED' | 'NOT_CONFIGURED' | 'PENDING';
  data: T | null;
  error?: string | null;
}

export interface PreVisitSummaryData {
  urgency: 'Low' | 'Medium' | 'High';
  chiefComplaint: string;
  suggestedQuestions: string[];
}

export interface PreVisitSummary extends Partial<PreVisitSummaryData> {
  urgency?: 'Low' | 'Medium' | 'High';
  chiefComplaint?: string;
  suggestedQuestions?: string[];
  ollama?: DualEngineResult<PreVisitSummaryData>;
  gemini?: DualEngineResult<PreVisitSummaryData>;
}

export interface PostVisitSummaryData {
  patientSummary?: string;
  summary: string;
  medicationSchedule: string[];
  followUpSteps: string[];
}

export interface PostVisitSummary extends Partial<PostVisitSummaryData> {
  patientSummary?: string;
  summary?: string;
  medicationSchedule?: string[];
  followUpSteps?: string[];
  ollama?: DualEngineResult<PostVisitSummaryData>;
  gemini?: DualEngineResult<PostVisitSummaryData>;
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
  postVisitSummary?: PostVisitSummary | any;
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

