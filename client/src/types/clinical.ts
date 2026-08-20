export interface MedicineItem {
  _id?: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface ClinicalRecord {
  _id: string;
  appointmentId: string;
  patientId: {
    _id: string;
    name: string;
    email: string;
  } | string;
  doctorId: {
    _id: string;
    name: string;
    email: string;
  } | string;
  clinicalNotes: string;
  diagnosisNotes?: string;
  patientInstructions?: string;
  followUpDate?: string | null;
  postVisitSummary?: string | null;
  aiStatus?: 'PENDING' | 'READY' | 'FAILED';
  createdAt?: string;
  updatedAt?: string;
}

export interface Prescription {
  _id: string;
  appointmentId: {
    _id: string;
    date: string;
    startTime: string;
    endTime: string;
    reason?: string;
  } | string;
  patientId: {
    _id: string;
    name: string;
    email: string;
  } | string;
  doctorId: {
    _id: string;
    name: string;
    email: string;
  } | string;
  medicines: MedicineItem[];
  additionalInstructions?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SaveClinicalRecordRequest {
  clinicalNotes: string;
  diagnosisNotes?: string;
  patientInstructions?: string;
  followUpDate?: string | null;
}

export interface SavePrescriptionRequest {
  medicines: MedicineItem[];
  additionalInstructions?: string;
}

export interface CompleteConsultationRequest {
  clinicalNotes?: string;
  diagnosisNotes?: string;
  patientInstructions?: string;
  followUpDate?: string | null;
  medicines?: MedicineItem[];
  additionalInstructions?: string;
}
