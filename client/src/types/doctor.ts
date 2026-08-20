export interface WorkingDayConfig {
  enabled: boolean;
  start: string | null; // HH:mm
  end: string | null;   // HH:mm
}

export interface WorkingHours {
  monday: WorkingDayConfig;
  tuesday: WorkingDayConfig;
  wednesday: WorkingDayConfig;
  thursday: WorkingDayConfig;
  friday: WorkingDayConfig;
  saturday: WorkingDayConfig;
  sunday: WorkingDayConfig;
}

export interface Leave {
  _id?: string;
  date: string; // YYYY-MM-DD
  reason: string;
}

export interface Doctor {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: 'DOCTOR';
  specialization: string;
  qualifications: string[];
  experienceYears: number;
  consultationFee: number;
  clinicName: string;
  clinicAddress: string;
  bio: string;
  phone: string;
  profileImage: string;
  workingDays: string[];
  slotDuration: number;
  isAvailable: boolean;
  isActive: boolean;
  workingHours: WorkingHours;
  leaves: Leave[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDoctorRequest {
  name: string;
  email: string;
  password: string;
  specialization: string;
  qualifications?: string[];
  experienceYears?: number;
  consultationFee?: number;
  clinicName?: string;
  clinicAddress?: string;
  bio?: string;
  phone?: string;
  profileImage?: string;
  workingDays?: string[];
  slotDuration?: number;
  isAvailable?: boolean;
  workingHours?: WorkingHours;
}

export interface UpdateDoctorRequest {
  name?: string;
  specialization?: string;
  qualifications?: string[];
  experienceYears?: number;
  consultationFee?: number;
  clinicName?: string;
  clinicAddress?: string;
  bio?: string;
  phone?: string;
  profileImage?: string;
  workingDays?: string[];
  slotDuration?: number;
  isAvailable?: boolean;
  isActive?: boolean;
  workingHours?: WorkingHours;
}

export interface LeaveRequest {
  date: string;
  reason?: string;
}
