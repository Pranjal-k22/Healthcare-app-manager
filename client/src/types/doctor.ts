export interface WorkingDay {
  enabled: boolean;
  start: string | null; // HH:mm
  end: string | null;   // HH:mm
}

export interface WorkingHours {
  monday: WorkingDay;
  tuesday: WorkingDay;
  wednesday: WorkingDay;
  thursday: WorkingDay;
  friday: WorkingDay;
  saturday: WorkingDay;
  sunday: WorkingDay;
}

export interface Leave {
  _id?: string;
  date: string; // YYYY-MM-DD
  reason: string;
  createdAt?: string;
}

export interface Doctor {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: 'DOCTOR';
  specialization: string;
  slotDuration: number;
  workingHours: WorkingHours;
  leaves: Leave[];
  createdAt: string;
  updatedAt?: string;
}

export interface CreateDoctorRequest {
  name: string;
  email: string;
  password: string;
  specialization: string;
  slotDuration: number;
  workingHours: WorkingHours;
}

export interface UpdateDoctorRequest {
  name?: string;
  specialization?: string;
  slotDuration?: number;
  workingHours?: WorkingHours;
}

export interface AddLeaveRequest {
  date: string;
  reason?: string;
}

export interface DoctorsApiResponse {
  success: boolean;
  count: number;
  data: Doctor[];
}

export interface SingleDoctorApiResponse {
  success: boolean;
  message?: string;
  data: Doctor;
}

export interface LeavesApiResponse {
  success: boolean;
  message?: string;
  data: Leave[];
}
