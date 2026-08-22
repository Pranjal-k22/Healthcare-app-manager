import apiClient from './apiClient';

export interface UserProfileData {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phone?: string;
  };
  avatarUrl?: string;
  memberSince?: string;
}

/**
 * Get current patient's profile
 */
export const getPatientProfile = async (): Promise<UserProfileData> => {
  const response = await apiClient.get<{ success: boolean; data: UserProfileData }>(
    '/patient/profile'
  );
  return response.data.data;
};

/**
 * Update current patient's profile
 */
export const updatePatientProfile = async (
  data: Partial<UserProfileData>
): Promise<UserProfileData> => {
  const response = await apiClient.put<{ success: boolean; data: UserProfileData }>(
    '/patient/profile',
    data
  );
  return response.data.data;
};

/**
 * Change patient account password
 */
export const changePatientPassword = async (
  currentPassword: string,
  newPassword: string
): Promise<UserProfileData> => {
  const response = await apiClient.post<{ success: boolean; data: UserProfileData }>(
    '/patient/profile/change-password',
    { currentPassword, newPassword }
  );
  return response.data.data;
};
