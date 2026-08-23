export type UserRole = 'PATIENT' | 'DOCTOR' | 'ADMIN';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  role?: UserRole;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface ForgotPasswordData {
  email: string;
  role?: UserRole;
}

export interface ResetPasswordData {
  token: string;
  password: string;
  role?: UserRole;
}

export interface SetPasswordData {
  token: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token: string;
  user: User;
}

export interface MeResponse {
  success: boolean;
  user: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (data: RegisterData) => Promise<User>;
  forgotPassword: (data: ForgotPasswordData) => Promise<{ success: boolean; message: string }>;
  resetPassword: (data: ResetPasswordData) => Promise<{ success: boolean; message: string }>;
  setPassword: (data: SetPasswordData) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}
