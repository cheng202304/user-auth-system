// User role enum
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  TEACHER = 'teacher',
  STUDENT = 'student',
}

// User status enum
export enum UserStatus {
  DISABLED = 0,
  ACTIVE = 1,
}

// User DTO (from API)
export interface User {
  id: number;
  account: string;
  username: string;
  email?: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  status: UserStatus;
  created_at: string;
}

// Profile update data
export interface ProfileUpdateData {
  username?: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

// Password change data
export interface PasswordChangeData {
  oldPassword: string;
  newPassword: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Auth tokens
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Login response
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}
