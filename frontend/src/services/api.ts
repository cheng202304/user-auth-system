import { User, ProfileUpdateData, PasswordChangeData, ApiResponse, LoginResponse, UserRole, UserStatus } from '../types';

const API_BASE_URL = '/api';

// Helper to get auth token
function getAuthToken(): string | null {
  return localStorage.getItem('accessToken');
}

// Helper to set auth token
export function setAuthToken(token: string): void {
  localStorage.setItem('accessToken', token);
}

// Helper to remove auth token
export function removeAuthToken(): void {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

// API helper
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getAuthToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  return data;
}

// Auth API
export const authApi = {
  // Register
  async register(email: string, password: string, username?: string, phone?: string): Promise<ApiResponse<User>> {
    return fetchApi<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, username, phone }),
    });
  },

  // Login
  async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    const response = await fetchApi<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data) {
      setAuthToken(response.data.accessToken);
    }

    return response;
  },

  // Logout
  async logout(): Promise<ApiResponse<void>> {
    const response = await fetchApi<void>('/auth/logout', {
      method: 'POST',
    });

    removeAuthToken();
    return response;
  },
};

// Profile API
export const profileApi = {
  // Get current user profile
  async getProfile(): Promise<ApiResponse<User>> {
    return fetchApi<User>('/profile', {
      method: 'GET',
    });
  },

  // Update profile
  async updateProfile(data: ProfileUpdateData): Promise<ApiResponse<User>> {
    return fetchApi<User>('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Change password
  async changePassword(data: PasswordChangeData): Promise<ApiResponse<void>> {
    return fetchApi<void>('/profile/password', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};
