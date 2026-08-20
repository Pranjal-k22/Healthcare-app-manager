export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface DoctorLeaveItem {
  id: string;
  doctorId: string | { _id: string; name: string; email: string };
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  rejectionReason?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConflictingAppointment {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  patientName: string;
  reason: string;
}

export interface LeaveConflictCheckResult {
  hasConflicts: boolean;
  conflictCount: number;
  conflictingAppointments: ConflictingAppointment[];
}
