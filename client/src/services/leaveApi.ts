import apiClient from './apiClient';
import {
  DoctorLeaveItem,
  LeaveConflictCheckResult,
  LeaveStatus,
} from '../types/leave';

/**
 * Doctor: Create / request a new leave period
 */
export const createDoctorLeave = async (data: {
  startDate: string;
  endDate: string;
  reason: string;
}): Promise<DoctorLeaveItem> => {
  const response = await apiClient.post<{
    success: boolean;
    data: DoctorLeaveItem;
    message?: string;
  }>('/doctor/leaves', data);

  return response.data.data;
};

/**
 * Doctor: Get own leave records
 */
export const getMyDoctorLeaves = async (
  status?: LeaveStatus
): Promise<DoctorLeaveItem[]> => {
  const response = await apiClient.get<{
    success: boolean;
    data: DoctorLeaveItem[];
  }>('/doctor/leaves', {
    params: { status },
  });

  return response.data.data;
};

/**
 * Doctor: Pre-check for conflicting appointments for a proposed date range
 */
export const checkLeaveConflicts = async (
  startDate: string,
  endDate: string
): Promise<LeaveConflictCheckResult> => {
  const response = await apiClient.get<{
    success: boolean;
    data: LeaveConflictCheckResult;
  }>('/doctor/leaves/conflicts', {
    params: { startDate, endDate },
  });

  return response.data.data;
};

/**
 * Doctor or Admin: Cancel an existing leave
 */
export const cancelDoctorLeave = async (
  leaveId: string
): Promise<DoctorLeaveItem> => {
  const response = await apiClient.patch<{
    success: boolean;
    data: DoctorLeaveItem;
  }>(`/doctor/leaves/${leaveId}/cancel`);

  return response.data.data;
};

/**
 * Admin: Get all doctor leaves
 */
export const getAllDoctorLeavesAdmin = async (params: {
  status?: LeaveStatus;
  doctorId?: string;
} = {}): Promise<DoctorLeaveItem[]> => {
  const response = await apiClient.get<{
    success: boolean;
    data: DoctorLeaveItem[];
  }>('/admin/leaves', { params });

  return response.data.data;
};

/**
 * Admin: Approve or Reject a doctor leave request
 */
export const updateDoctorLeaveStatusAdmin = async (
  leaveId: string,
  data: {
    status: 'APPROVED' | 'REJECTED';
    adminNotes?: string;
  }
): Promise<{ leave: DoctorLeaveItem; message: string }> => {
  const response = await apiClient.patch<{
    success: boolean;
    data: DoctorLeaveItem;
    message: string;
  }>(`/admin/leaves/${leaveId}/status`, data);

  return {
    leave: response.data.data,
    message: response.data.message || 'Leave status updated successfully',
  };
};
