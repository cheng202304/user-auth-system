/**
 * API base configuration
 * Use VITE_API_URL environment variable or default to '/api'
 */
const API_BASE_URL = '/api';

/**
 * API response interface
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
}

/**
 * User data interface
 */
export interface User {
  id: number;
  account: string;
  email: string;
  username: string;
  role: string;
  status: number;
  avatar?: string;
  created_at: string;
}

/**
 * Login request interface
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Login response interface
 */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

/**
 * Register request interface
 */
export interface RegisterRequest {
  email: string;
  password: string;
  username?: string;
}

/**
 * API error class
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * API client class
 */
class ApiClient {
  private baseUrl: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.loadTokens();
  }

  /**
   * Load tokens from localStorage
   */
  private loadTokens(): void {
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  /**
   * Save tokens to localStorage
   */
  private saveTokens(accessToken: string, refreshToken: string): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  /**
   * Clear tokens from localStorage
   */
  private clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  /**
   * Make API request
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    // Add authorization header if access token exists
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data: ApiResponse<T> = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.error || 'API request failed',
        response.status,
        data
      );
    }

    return data;
  }

  /**
   * Handle token refresh
   */
  private async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new ApiError('No refresh token available');
    }

    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new ApiError(data.error || 'Token refresh failed');
      }

      // Save new tokens
      this.saveTokens(data.data.accessToken, data.data.refreshToken);
    } catch (error) {
      // Clear tokens on refresh failure
      this.clearTokens();
      throw error;
    }
  }

  /**
   * Make authenticated API request with automatic token refresh
   */
  async authenticatedRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      return await this.request<T>(endpoint, options);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        // Token expired, try to refresh
        try {
          await this.refreshAccessToken();
          return await this.request<T>(endpoint, options);
        } catch (refreshError) {
          // Refresh failed, clear tokens
          this.clearTokens();
          throw new ApiError('Session expired, please login again');
        }
      }
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data) {
      this.saveTokens(response.data.accessToken, response.data.refreshToken);
      return response.data;
    }

    throw new ApiError('Login failed');
  }

  /**
   * Register user
   */
  async register(userData: RegisterRequest): Promise<User> {
    const response = await this.request<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success && response.data) {
      return response.data;
    }

    throw new ApiError('Registration failed');
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await this.authenticatedRequest<void>('/auth/logout', {
        method: 'POST',
      });
    } finally {
      // Always clear tokens locally
      this.clearTokens();
    }
  }

  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<User> {
    const response = await this.authenticatedRequest<User>('/auth/me');

    if (response.success && response.data) {
      return response.data;
    }

    throw new ApiError('Failed to get user info');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }
}

/**
 * Export singleton API client instance
 */
export const apiClient = new ApiClient(API_BASE_URL);

/**
 * Profile update data interface
 */
export interface ProfileUpdateData {
  username?: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

/**
 * Password change data interface
 */
export interface PasswordChangeData {
  oldPassword: string;
  newPassword: string;
}

/**
 * Profile API methods
 */
export const profileApi = {
  /**
   * Get current user profile
   */
  async getProfile(): Promise<ApiResponse<User>> {
    return apiClient.authenticatedRequest<User>('/profile', {
      method: 'GET',
    });
  },

  /**
   * Update current user profile
   */
  async updateProfile(data: ProfileUpdateData): Promise<ApiResponse<User>> {
    return apiClient.authenticatedRequest<User>('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Change user password
   */
  async changePassword(data: PasswordChangeData): Promise<ApiResponse<void>> {
    return apiClient.authenticatedRequest<void>('/profile/password', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

/**
 * Set authentication token
 */
export function setAuthToken(token: string): void {
  localStorage.setItem('accessToken', token);
}

/**
 * Remove authentication token
 */
export function removeAuthToken(): void {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}
