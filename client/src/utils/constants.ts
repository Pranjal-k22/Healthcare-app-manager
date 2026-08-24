import { UserRole } from '../types/auth';

export const ROLES = {
  PATIENT: 'PATIENT',
  DOCTOR: 'DOCTOR',
  ADMIN: 'ADMIN',
} as const;

export const TOKEN_STORAGE_KEY = 'healthpulse_auth_token';

export const ROLE_DASHBOARD_ROUTES: Record<UserRole, string> = {
  PATIENT: '/patient/dashboard',
  DOCTOR: '/doctor/dashboard',
  ADMIN: '/admin/dashboard',
};

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://healthpulse-api-4vhy.onrender.com';
